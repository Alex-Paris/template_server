interface IMailConfig {
  /** Driver to be used for mail sending. _(Default: "ethereal")_ . */
  driver: "ethereal" | "ses";

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

  defaults: {
    from: {
      email: "me@alexparis.dev",
      name: "Alex - Paris Code",
    },
  },
} as IMailConfig;
