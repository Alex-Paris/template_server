const isTest = process.env.NODE_ENV === "test";

export default {
  limits: {
    // Rate limit for all requested routes.
    failConsecutiveIpAttemptsPoints: isTest ? 1000 : 5,
    failConsecutiveIpAttemptsInMemoBlockPoints: isTest ? 1000 : 10,
    failConsecutiveIpAttemptsInsurancePoints: isTest ? 1000 : 1,

    // Rate limit for count an IP fails authentication attempts.
    loginFailIpPerDayPoints: isTest ? 0 : 100,

    // Rate limit for wrong authentication attempts for an email and IP.
    // Points reseted after a successful login.
    loginFailConsecutiveEmailAndIp: isTest ? 0 : 10,
  },
};
