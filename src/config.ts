import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://mintu.org", // replace this with your deployed domain
  author: "Mint",
  profile: "https://satnaing.dev/",
  desc: "Mint's Hello World",
  title: "Mint's Blog",
  ogImage: "astropaper-og.jpg", // website image
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  // {
  //   name: "Github",
  //   href: "https://github.com/undefinedmint",
  //   linkTitle: `Me on Github`,
  //   active: true,
  // },
  // {
  //   name: "Instagram",
  //   href: "https://instagram.com/i__am__mint/",
  //   linkTitle: `Me on Instagram`,
  //   active: false,
  // },
  {
    name: "Mail",
    href: "mailto:undefinedmint@proton.me",
    linkTitle: `Send an email to me`,
    active: true,
  },
  {
    name: "WeChat",
    href: "/assets/wechat-qrcode.jpg",
    linkTitle: `Add me on WeChat: i__am__mint`,
    active: true,
  },
  
];
