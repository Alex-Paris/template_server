interface IMailConfig {
  /** Driver to be used for mail sending. _(Default: "ethereal")_ . */
  driver: "ethereal" | "awsSES";

  /** Driver configurations. */
  config: {
    aws: {
      region: string;
    };
  };

  /** Default "from" data in mail sender. */
  defaults: {
    from: {
      email: string;
      name: string;
    };
  };
}

export default {
  driver: process.env.MAIL_DRIVER || "ethereal",

  config: {
    aws: {
      region: process.env.AWS_SES_REGION,
    },
  },

  defaults: {
    from: {
      email: process.env.AWS_SES_MAIL,
      name: process.env.AWS_SES_NAME,
    },
  },
} as IMailConfig;
