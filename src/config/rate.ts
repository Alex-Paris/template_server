export default {
  limits: {
    rateLimitPoints: process.env.NODE_ENV === "test" ? 1000 : 5,
    rateLimitInMemoBlockPoints: process.env.NODE_ENV === "test" ? 1000 : 10,
    rateLimitInsurancePoints: process.env.NODE_ENV === "test" ? 1000 : 1,
    maxConsecutiveAttemptsByIPperSeconds:
      process.env.NODE_ENV === "test" ? 0 : 5,
    maxWrongAttemptsByIPperDay: process.env.NODE_ENV === "test" ? 0 : 5,
    maxConsecutiveFailsByUsernameAndIP:
      process.env.NODE_ENV === "test" ? 0 : 10,
  },
};
