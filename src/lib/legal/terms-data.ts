import { AppLanguage } from "@prisma/client";

export type LegalBlock = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  effectiveLabel: string;
  effectiveDate: string;
  intro: string;
  blocks: LegalBlock[];
};

const EN: LegalDoc = {
  metaTitle: "Terms of Use",
  metaDescription:
    "Terms and conditions governing your use of Luna, the event discovery and registration platform.",
  heading: "Terms of Use",
  effectiveLabel: "Effective date",
  effectiveDate: "March 25, 2026",
  intro:
    "These Terms of Use (“Terms”) govern access to and use of the Luna website, applications, and related services (collectively, the “Service”) operated by Luna (“we”, “us”, or “our”). By creating an account, browsing the Service, hosting an event, or registering for an event, you agree to these Terms. If you do not agree, do not use the Service.",
  blocks: [
    {
      title: "1. Eligibility and accounts",
      paragraphs: [
        "You must be at least the age of digital consent in your jurisdiction (typically 16 or older, or 13 with parental consent where applicable) to use the Service. You represent that the information you provide is accurate and that you will keep it up to date.",
        "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us promptly if you suspect unauthorized access. We may suspend or terminate accounts that violate these Terms or pose a risk to the Service or other users.",
      ],
    },
    {
      title: "2. Description of the Service",
      paragraphs: [
        "Luna provides tools to publish event information, collect registration requests or links to third-party registration, and display public profiles for organizers. Features may change over time. We do not guarantee uninterrupted or error-free operation.",
        "The Service is not a ticketing or payment processor unless we explicitly offer such functionality. Any payments between organizers and attendees occur outside Luna unless stated otherwise on a specific feature.",
      ],
    },
    {
      title: "3. User roles",
      paragraphs: [
        "Visitors may browse public content. Registered users may manage a profile, create or edit events they are permitted to manage, and register for events where registration is offered through Luna.",
        "Organizers are responsible for the accuracy of event details (dates, location, format, capacity, links to external registration, and meeting links). Moderators and administrators may access additional tools for platform safety and compliance; their use of such tools is governed by internal policies and applicable law.",
      ],
    },
    {
      title: "4. Acceptable use",
      paragraphs: [
        "You agree not to misuse the Service. Without limitation, you must not:",
      ],
      list: [
        "Violate any applicable law or regulation.",
        "Infringe intellectual property, privacy, or publicity rights of others.",
        "Upload malware, scrape the Service in a way that harms performance, or attempt unauthorized access to systems or data.",
        "Use the Service to distribute spam, deceptive content, hate speech, harassment, or illegal goods or services.",
        "Impersonate any person or entity or misrepresent your affiliation.",
        "Circumvent technical measures, quotas, or security controls we employ.",
      ],
    },
    {
      title: "5. Events, registrations, and third-party links",
      paragraphs: [
        "Events are created by independent organizers. Luna is a platform; unless we expressly state otherwise, we are not the organizer of your event and are not a party to agreements between organizers and attendees.",
        "For internal registration on Luna, you understand that submitting a registration request does not guarantee admission if the organizer operates a waitlist, approval flow, or capacity limits. Organizers may use attendee information in accordance with their own policies and applicable law.",
        "For external registration, Luna may display a link to a third-party site. We do not control those sites and are not responsible for their content, practices, or availability. You access third-party services at your own risk.",
      ],
    },
    {
      title: "6. Content you provide",
      paragraphs: [
        "You retain ownership of content you upload or post (such as descriptions, images, and profile information). You grant us a non-exclusive, worldwide, royalty-free license to host, display, reproduce, and distribute such content solely to operate, improve, and promote the Service.",
        "You represent that you have the rights necessary to grant the above license. We may remove content that violates these Terms or that we reasonably believe is unlawful or harmful.",
      ],
    },
    {
      title: "7. Intellectual property",
      paragraphs: [
        "The Service, including its design, branding, software, and documentation, is owned by Luna or its licensors and is protected by intellectual property laws. Except as expressly permitted, you may not copy, modify, distribute, sell, or reverse engineer any part of the Service.",
      ],
    },
    {
      title: "8. Telegram and other integrations",
      paragraphs: [
        "Optional features may rely on third-party services (for example Telegram for authentication flows). Your use of those services is subject to the third party’s terms and privacy policy. We are not responsible for outages or changes imposed by third-party providers.",
      ],
    },
    {
      title: "9. Disclaimers",
      paragraphs: [
        "THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.",
        "We do not warrant that events are safe, accurate, or suitable for any purpose. You are solely responsible for decisions to attend, host, or interact with other users.",
      ],
    },
    {
      title: "10. Limitation of liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LUNA, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.",
        "OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED US DOLLARS (USD 100), IF YOU HAVE NOT PAID US.",
        "Some jurisdictions do not allow certain limitations; in those jurisdictions, our liability is limited to the fullest extent permitted by law.",
      ],
    },
    {
      title: "11. Indemnity",
      paragraphs: [
        "You agree to defend, indemnify, and hold harmless Luna and its affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys’ fees) arising out of your content, your events, your use of the Service, or your violation of these Terms or applicable law.",
      ],
    },
    {
      title: "12. Suspension and termination",
      paragraphs: [
        "We may suspend or terminate access to the Service at any time, with or without notice, for conduct that we believe violates these Terms or harms users, us, or third parties. You may stop using the Service at any time. Provisions that by their nature should survive (including ownership, disclaimers, limitations of liability, and indemnity) will survive termination.",
      ],
    },
    {
      title: "13. Changes to the Service and Terms",
      paragraphs: [
        "We may modify the Service or these Terms. If we make material changes, we will provide notice by posting an updated version on the Service or by other reasonable means. Continued use after the effective date constitutes acceptance. If you do not agree, you must stop using the Service.",
      ],
    },
    {
      title: "14. Governing law and disputes",
      paragraphs: [
        "These Terms are governed by the laws applicable in the jurisdiction we designate in a future update, without regard to conflict-of-law principles. You agree to submit to the exclusive jurisdiction of the courts in that jurisdiction for disputes arising from these Terms or the Service, unless mandatory consumer protection law in your country requires otherwise.",
        "If you are a consumer in the European Economic Area or the United Kingdom, you may benefit from mandatory rights under local law; nothing in these Terms limits those rights.",
      ],
    },
    {
      title: "15. Contact",
      paragraphs: [
        "For questions about these Terms, contact us through the channels provided on the Service (for example the organizer or support contact listed on the site). Replace this paragraph with a dedicated legal contact email when available.",
      ],
    },
  ],
};

const RU: LegalDoc = {
  metaTitle: "Условия использования",
  metaDescription:
    "Условия использования сервиса Luna: платформы для публикации событий и регистрации участников.",
  heading: "Условия использования",
  effectiveLabel: "Дата вступления в силу",
  effectiveDate: "25 марта 2026 г.",
  intro:
    "Настоящие Условия использования («Условия») регулируют доступ к сайту, приложениям и связанным сервисам Luna (совместно — «Сервис»), а также их использование. Создавая учётную запись, просматривая Сервис, проводя мероприятие или регистрируясь на мероприятие, вы соглашаетесь с Условиями. Если вы не согласны, не используйте Сервис.",
  blocks: [
    {
      title: "1. Допустимый возраст и учётные записи",
      paragraphs: [
        "Вам должно быть не меньше возраста, с которого в вашей стране разрешено самостоятельное согласие на обработку данных и использование онлайн-сервисов (часто 16 лет, либо 13 с согласия родителей). Вы подтверждаете, что указанные данные достоверны и будете своевременно их обновлять.",
        "Вы несёте ответственность за сохранность учётных данных и за все действия под вашей учётной записью. Сообщите нам о подозрительном доступе. Мы можем приостановить или удалить учётную запись при нарушении Условий или угрозе для Сервиса и других пользователей.",
      ],
    },
    {
      title: "2. Описание Сервиса",
      paragraphs: [
        "Luna предоставляет инструменты для публикации информации о мероприятиях, приёма заявок на участие или перенаправления на стороннюю регистрацию, а также для отображения публичных профилей организаторов. Набор функций может меняться. Мы не гарантируем бесперебойную или безошибочную работу.",
        "Сервис не является платёжным или билетным агентом, если иное явно не указано. Расчёты между организаторами и участниками, как правило, происходят вне Luna, если отдельная функция об этом не говорит.",
      ],
    },
    {
      title: "3. Роли пользователей",
      paragraphs: [
        "Посетители могут просматривать публичный контент. Зарегистрированные пользователи могут вести профиль, создавать и редактировать мероприятия (если им это разрешено) и регистрироваться на мероприятия, где регистрация проходит через Luna.",
        "Организаторы несут ответственность за достоверность данных о мероприятии (дата, место, формат, вместимость, ссылки на внешнюю регистрацию, ссылки на онлайн-встречи). Модераторы и администраторы могут использовать дополнительные инструменты в целях безопасности и соблюдения требований закона.",
      ],
    },
    {
      title: "4. Допустимое поведение",
      paragraphs: [
        "Запрещается использовать Сервис во вред или с нарушением закона. В частности, нельзя:",
      ],
      list: [
        "Нарушать применимое законодательство.",
        "Нарушать права интеллектуальной собственности, неприкосновенность частной жизни или иные права третьих лиц.",
        "Распространять вредоносное ПО, перегружать Сервис автоматическими запросами, пытаться получить несанкционированный доступ.",
        "Распространять спам, вводящую в заблуждение информацию, призывы к ненависти, домогательства, незаконные товары или услуги.",
        "Выдавать себя за другое лицо или вводить в заблуждение относительно своей принадлежности.",
        "Обходить технические ограничения и меры безопасности.",
      ],
    },
    {
      title: "5. Мероприятия, регистрация и сторонние ссылки",
      paragraphs: [
        "Мероприятия создают независимые организаторы. Luna — платформа; если прямо не указано иное, мы не являемся организатором вашего мероприятия и не стороной договоров между организатором и участниками.",
        "При внутренней регистрации в Luna подача заявки не гарантирует участие при листе ожидания, модерации или лимите мест. Организатор может использовать данные участников в рамках своей политики и закона.",
        "При внешней регистрации может отображаться ссылка на сторонний сайт. Мы не контролируем такие сайты и не отвечаем за их содержание и практики. Переходите по ссылкам на свой риск.",
      ],
    },
    {
      title: "6. Контент пользователей",
      paragraphs: [
        "Права на контент, который вы размещаете (тексты, изображения, профиль), сохраняются за вами. Вы предоставляете нам неисключительную безвозмездную лицензию на хостинг, отображение, воспроизведение и распространение такого контента в целях работы, улучшения и продвижения Сервиса.",
        "Вы подтверждаете наличие прав для предоставления лицензии. Мы можем удалить контент, нарушающий Условия или, по нашему разумному мнению, противоречащий закону или создающий угрозу.",
      ],
    },
    {
      title: "7. Интеллектуальная собственность",
      paragraphs: [
        "Сервис, включая оформление, бренд, программное обеспечение и документацию, принадлежит Luna или правообладателям и охраняется законом. Без явного разрешения нельзя копировать, изменять, распространять или декомпилировать Сервис.",
      ],
    },
    {
      title: "8. Telegram и интеграции",
      paragraphs: [
        "Отдельные функции могут использовать сервисы третьих сторон (например Telegram для авторизации). Их использование регулируется условиями и политикой конфиденциальности этих сторон. Мы не отвечают за сбои или изменения на стороне провайдеров.",
      ],
    },
    {
      title: "9. Отказ от гарантий",
      paragraphs: [
        "СЕРВИС ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ» И «ПО МЕРЕ ДОСТУПНОСТИ» БЕЗ КАКИХ-ЛИБО ПРЯМЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ ГАРАНТИЙ, В ТОМ ЧИСЛЕ ТОВАРНОЙ ПРИГОДНОСТИ, ПРИГОДНОСТИ ДЛЯ ОПРЕДЕЛЁННОЙ ЦЕЛИ И НЕНАРУШЕНИЯ ПРАВ, В ПРЕДЕЛАХ, ДОПУСТИМЫХ ЗАКОНОМ.",
        "Мы не гарантируем безопасность, точность или пригодность мероприятий. Решения об участии и взаимодействии с другими пользователями принимаете вы.",
      ],
    },
    {
      title: "10. Ограничение ответственности",
      paragraphs: [
        "В МАКСИМАЛЬНОЙ СТЕПЕНИ, ДОПУСТИМОЙ ЗАКОНОМ, LUNA И СВЯЗАННЫЕ С НЕЙ ЛИЦА НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ЗА КОСВЕННЫЙ, СЛУЧАЙНЫЙ, ОСОБЫЙ, ПОСЛЕДУЮЩИЙ ИЛИ ШТРАФНОЙ УЩЕРБ, УПУЩЕННУЮ ВЫГОДУ, ПОТЕРЮ ДАННЫХ ИЛИ ДЕЛОВОЙ РЕПУТАЦИИ, СВЯЗАННЫЕ С ИСПОЛЬЗОВАНИЕМ СЕРВИСА.",
        "СОВОКУПНАЯ ОТВЕТСТВЕННОСТЬ ПО ЛЮБЫМ ТРЕБОВАНИЯМ ОГРАНИЧИВАЕТСЯ БОЛЬШЕЙ ИЗ ВЕЛИЧИН: (A) СУММЫ, УПЛАЧЕННОЙ ВАМИ ЗА СЕРВИС ЗА ДВЕНАДЦАТЬ МЕСЯЦЕВ ДО ВОЗНИКНОВЕНИЯ ТРЕБОВАНИЯ, ИЛИ (B) СТА ДОЛЛАРОВ США (USD 100), ЕСЛИ ВЫ НИЧЕГО НЕ ПЛАТИЛИ.",
        "В отдельных юрисдикциях часть ограничений может не применяться — в таком случае ответственность ограничивается в пределах, разрешённых законом.",
      ],
    },
    {
      title: "11. Возмещение убытков",
      paragraphs: [
        "Вы обязуетесь возмещать убытки и ограждать Luna и связанные лица от претензий, убытков, расходов и издержек (включая разумные гонорары адвокатов), возникших в связи с вашим контентом, мероприятиями, использованием Сервиса или нарушением Условий и закона.",
      ],
    },
    {
      title: "12. Блокировка и прекращение",
      paragraphs: [
        "Мы можем приостановить или прекратить доступ к Сервису с уведомлением или без него при нарушении Условий или угрозе для пользователей, нас или третьих лиц. Вы можете прекратить использование в любой момент. Положения, которые по смыслу должны сохраняться (включая права, отказ от гарантий, ограничение ответственности и возмещение), сохраняют силу.",
      ],
    },
    {
      title: "13. Изменения Сервиса и Условий",
      paragraphs: [
        "Мы можем изменять Сервис и настоящие Условия. О существенных изменениях мы уведомим размещением обновлённой версии на Сервисе или иным разумным способом. Продолжение использования после даты вступления изменений означает согласие. Если не согласны — прекратите использование Сервиса.",
      ],
    },
    {
      title: "14. Применимое право и споры",
      paragraphs: [
        "К Условиям применяется право юрисдикции, которую мы укажем в будущем при необходимости, без учёта коллизионных норм. Споры подлежат рассмотрению в судах указанной юрисдикции, если императивные нормы права страны вашего проживания как потребителя не предусматривают иное.",
        "Если вы потребитель в ЕЭЗ или Великобритании, вам могут принадлежать обязательные права по местному законодательству; настоящие Условия их не ограничивают.",
      ],
    },
    {
      title: "15. Контакты",
      paragraphs: [
        "По вопросам Условий свяжитесь с нами через контакты, указанные на Сервисе. При появлении отдельного юридического e-mail замените этот абзац на актуальный адрес.",
      ],
    },
  ],
};

export function getTermsDocument(language: AppLanguage): LegalDoc {
  return language === AppLanguage.RU ? RU : EN;
}
