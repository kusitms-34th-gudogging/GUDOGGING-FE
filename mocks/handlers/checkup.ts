import { http } from 'msw';

import { checkupForm, fillCheckupText } from '../checkupQuestions.ts';
import {
  type AnswerType,
  db,
  findSubscription,
  latestCheckup,
  monthlyAmount,
  nextBilling,
  scoreCheckup,
  today,
  toIso,
  uuid,
} from '../db.ts';
import { fail, notFound, ok } from '../response.ts';

// 고른 점수의 선택지 문구 (상세·결과의 usageAnswer 등)
const optionText = (category: string, type: AnswerType, score: number) =>
  checkupForm(category).questions.find((q) => q.type === type)!.options[score - 1].text;

export const checkupHandlers = [
  http.get('/api/v1/subscriptions/:subscriptionId/checkups/form', ({ params }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    if (s.status === 'ENDED') return fail(409, 40501, '구독 종료된 구독입니다.');
    const form = checkupForm(s.category);
    const fill = (text: string) =>
      fillCheckupText(text, {
        name: s.serviceName,
        monthly: monthlyAmount(s),
        yearly: monthlyAmount(s) * 12,
        amount: s.amount,
        next: nextBilling(s),
      });
    return ok('점검 문항을 조회했습니다.', {
      category: s.category,
      ...form,
      questions: form.questions.map((q) => ({ ...q, label: fill(q.label), hint: fill(q.hint) })),
      lastMemo: latestCheckup(s.subscriptionId)?.memo ?? null,
      serviceName: s.serviceName,
      // 명세: amount는 월 환산 금액
      amount: monthlyAmount(s),
      yearlyAmount: monthlyAmount(s) * 12,
      nextBillingDate: toIso(nextBilling(s)),
    });
  }),
  http.post('/api/v1/subscriptions/:subscriptionId/checkups', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    const body = (await request.json()) as {
      answers: { type: AnswerType; score: number }[];
      memo?: string;
    };
    const answers = Object.fromEntries(body.answers.map((a) => [a.type, a.score])) as Record<
      AnswerType,
      number
    >;
    const checkup = {
      checkupId: uuid(),
      subscriptionId: s.subscriptionId,
      checkedAt: toIso(today()),
      answers,
      answerTexts: {
        USAGE: optionText(s.category, 'USAGE', answers.USAGE),
        SATISFACTION: optionText(s.category, 'SATISFACTION', answers.SATISFACTION),
        PLAN: optionText(s.category, 'PLAN', answers.PLAN),
      },
      memo: body.memo || null,
      ...scoreCheckup(answers),
      decision: null,
      cancelReasons: [],
      cancelReasonText: null,
    };
    db.checkups.push(checkup);
    // 결과(점수·단계)는 결과 조회 API로 (명세)
    return ok('구독 점검을 제출했습니다.', { checkupId: checkup.checkupId }, 201);
  }),
  http.get('/api/v1/checkups/:checkupId', ({ params }) => {
    const c = db.checkups.find((v) => v.checkupId === params.checkupId);
    const s = c && findSubscription(c.subscriptionId);
    if (!c || !s) return notFound();
    const sameCategory = db.subscriptions
      // 점검한 구독은 구독 종료여도 포함 (명세)
      .filter((v) => (v.status === 'ACTIVE' || v === s) && v.category === s.category)
      // 점검 중인 구독이 맨 위
      .toSorted((a, b) => Number(b === s) - Number(a === s));
    // ponytail: 활용도 60% 기준으로 가장 높은/낮은 점수 응답, 가중치·동점 규칙은 서버
    const entries = Object.entries(c.answers) as [AnswerType, number][];
    const pick = c.score >= 60 ? Math.max : Math.min;
    const mainFactor =
      c.answers.PLAN === 1
        ? 'PLAN'
        : entries.find(([, v]) => v === pick(...entries.map(([, n]) => n)))![0];
    return ok('점검 결과를 조회했습니다.', {
      checkupId: c.checkupId,
      subscriptionId: s.subscriptionId,
      serviceName: s.serviceName,
      nextBillingDate: s.status === 'ENDED' ? null : toIso(nextBilling(s)),
      yearlyCost: monthlyAmount(s) * 12,
      score: c.score,
      stage: c.stage,
      usageAnswer: c.answerTexts.USAGE,
      satisfactionAnswer: c.answerTexts.SATISFACTION,
      planAnswer: c.answerTexts.PLAN,
      memo: c.memo,
      // ponytail: 번들 추천은 명세 mock 1개 고정, 추천 로직은 서버
      bundles: [
        {
          name: '통신사 OTT 번들',
          includes: ['넷플릭스', '티빙'],
          tags: ['OTT', '통신사'],
          monthlyPrice: 19900,
          monthlySaving: 5100,
          condition: '통신사 요금제 가입 필요',
          // 임의: providerType·priceType은 명세 mock에 없음
          providerType: '통신사',
          priceType: 'FIXED',
        },
      ],
      maxMonthlySaving: 5100,
      mainFactor,
      categorySpending: {
        category: s.category,
        monthlyTotal: sameCategory.reduce((sum, v) => sum + monthlyAmount(v), 0),
        subscriptionCount: sameCategory.length,
        items: sameCategory.slice(0, sameCategory.length > 5 ? 4 : 5).map((v) => ({
          serviceName: v.serviceName,
          logoUrl: v.logoUrl,
          monthlyAmount: monthlyAmount(v),
        })),
        otherCount: sameCategory.length > 5 ? sameCategory.length - 4 : 0,
      },
    });
  }),
  http.patch('/api/v1/checkups/:checkupId/decision', async ({ params, request }) => {
    const c = db.checkups.find((v) => v.checkupId === params.checkupId);
    if (!c) return notFound();
    const body = (await request.json()) as {
      decision: 'KEEP' | 'CANCEL';
      cancelReasons?: string[];
      cancelReasonText?: string;
    };
    Object.assign(c, {
      decision: body.decision,
      cancelReasons: body.cancelReasons ?? [],
      cancelReasonText: body.cancelReasonText ?? null,
    });
    return ok('점검 결정을 저장했습니다.', { checkupId: c.checkupId, decision: c.decision });
  }),
];
