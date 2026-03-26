import { AppLanguage } from "@prisma/client";
import type { LegalDoc } from "@/lib/legal/terms-data";

const EN: LegalDoc = {
  metaTitle: "Privacy Policy",
  metaDescription:
    "How Luna collects, uses, stores, and protects personal data when you use our event platform.",
  heading: "Privacy Policy",
  effectiveLabel: "Effective date",
  effectiveDate: "March 25, 2026",
  intro:
    "This Privacy Policy explains how Luna (“we”, “us”, or “our”) processes personal data when you use our website, applications, and related services (the “Service”). By using the Service, you acknowledge the practices described here. If you do not agree, please discontinue use of the Service.",
  blocks: [
    {
      title: "1. Data controller",
      paragraphs: [
        "The entity responsible for personal data processed in connection with the Service is identified on the Service or in separate notices we provide. Until a formal entity name and contact are published, references to “Luna” mean the operator of the Service as made available to you.",
      ],
    },
    {
      title: "2. Scope",
      paragraphs: [
        "This Policy applies to personal data we process as a controller when you use the Service. It does not govern how independent event organizers process attendee data for their own purposes; organizers may provide separate notices when they act as controllers.",
      ],
    },
    {
      title: "3. Categories of personal data we collect",
      paragraphs: [
        "Depending on how you use the Service, we may process:",
      ],
      list: [
        "Account data: name, email address (if provided), password hash, username, profile bio, avatar image URL, preferred language, role, and related account metadata.",
        "Telegram-related data: if you use Telegram authentication flows, Telegram user identifiers and one-time codes as needed to complete signup or login.",
        "Event and registration data: event titles, descriptions, schedules, locations, links, cover images, capacity, registration questions and answers you submit, and organizer identifiers.",
        "Technical data: IP address, device and browser type, approximate location derived from IP, timestamps, cookies or similar identifiers, and diagnostic logs.",
        "Communications: messages you send to us (for example support requests).",
      ],
    },
    {
      title: "4. Sources of data",
      paragraphs: [
        "We collect data directly from you (forms, uploads, settings), automatically when you use the Service (logs, cookies), and in some cases from third parties such as Telegram when you choose integrated authentication.",
      ],
    },
    {
      title: "5. Purposes and legal bases (EEA/UK reference)",
      paragraphs: [
        "Where the GDPR or UK GDPR applies, we rely on one or more of the following legal bases:",
      ],
      list: [
        "Performance of a contract: to provide accounts, events, registrations, and requested features.",
        "Legitimate interests: to secure the Service, prevent abuse, improve functionality, analyze aggregated usage, and communicate operational notices, balanced against your rights.",
        "Consent: where we ask for consent (for example optional marketing cookies or specific integrations), you may withdraw consent at any time.",
        "Legal obligation: to comply with law, court orders, or regulatory requests.",
      ],
    },
    {
      title: "6. How we use personal data",
      paragraphs: [
        "We use personal data to create and maintain accounts; publish and manage events; process registration requests and display attendee information to organizers as appropriate; operate authentication (including optional Telegram flows); personalize language and experience; enforce our Terms; detect fraud and security incidents; comply with law; and improve the Service through analytics in aggregated or de-identified form where possible.",
      ],
    },
    {
      title: "7. Sharing and subprocessors",
      paragraphs: [
        "We share personal data with service providers who assist us (for example hosting, database, content delivery, email, analytics, and file storage). They may process data only on our instructions and subject to appropriate safeguards.",
        "We may disclose information if required by law, to protect rights and safety, or in connection with a merger, acquisition, or asset sale, subject to applicable law.",
        "Public profiles and public event pages are visible to visitors as designed. Organizers see registration data for their events as needed to operate those events.",
      ],
    },
    {
      title: "8. International transfers",
      paragraphs: [
        "We may process and store data in countries other than your country of residence. Where required, we implement appropriate safeguards such as standard contractual clauses approved by relevant authorities.",
      ],
    },
    {
      title: "9. Retention",
      paragraphs: [
        "We retain personal data for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. Account data is generally kept until you delete your account or we delete it in accordance with our policies. Event and registration records may be retained for a period needed for organizers, legal compliance, and dispute resolution. Technical logs may be kept for shorter rolling periods unless longer retention is required for security.",
      ],
    },
    {
      title: "10. Security",
      paragraphs: [
        "We implement technical and organizational measures appropriate to the risk, including access controls, encryption in transit where standard for web services, and secure handling of credentials. No method of transmission or storage is completely secure; we cannot guarantee absolute security.",
      ],
    },
    {
      title: "11. Your rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, rectify, erase, restrict processing, object, data portability, and withdraw consent where processing is consent-based. You may also lodge a complaint with a supervisory authority.",
        "To exercise rights, contact us using the contact method published on the Service. We may need to verify your identity before responding. We will respond within the timeframe required by applicable law.",
      ],
    },
    {
      title: "12. Cookies and similar technologies",
      paragraphs: [
        "We use cookies and similar technologies for essential operation of the Service (for example session and security), preferences (such as theme or language), and, where applicable, analytics. You can control cookies through browser settings; disabling certain cookies may affect functionality.",
      ],
    },
    {
      title: "13. Children",
      paragraphs: [
        "The Service is not directed to children under the age at which consent is required in their jurisdiction without parental authorization. If you believe we have collected data from a child inappropriately, contact us and we will take appropriate steps.",
      ],
    },
    {
      title: "14. Changes to this Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. We will post the revised version on the Service and update the effective date. Material changes may be communicated by additional notice where appropriate.",
      ],
    },
    {
      title: "15. Contact",
      paragraphs: [
        "For privacy inquiries, contact us through the channels provided on the Service. Replace this paragraph with a dedicated privacy contact email when available.",
      ],
    },
  ],
};

const RU: LegalDoc = {
  metaTitle: "Политика конфиденциальности",
  metaDescription:
    "Как Luna обрабатывает персональные данные при использовании платформы событий.",
  heading: "Политика конфиденциальности",
  effectiveLabel: "Дата вступления в силу",
  effectiveDate: "25 марта 2026 г.",
  intro:
    "Настоящая Политика конфиденциальности описывает, как Luna («мы») обрабатывает персональные данные при использовании вами нашего сайта, приложений и связанных сервисов («Сервис»). Используя Сервис, вы подтверждаете, что ознакомились с практиками, описанными здесь. Если вы не согласны, прекратите использование Сервиса.",
  blocks: [
    {
      title: "1. Оператор данных",
      paragraphs: [
        "Ответственным за обработку персональных данных в связи с Сервисом является лицо, указанное на Сервисе или в отдельных уведомлениях. До публикации официального наименования и контактов под «Luna» понимается оператор Сервиса в той форме, в которой он вам предоставляется.",
      ],
    },
    {
      title: "2. Область действия",
      paragraphs: [
        "Политика распространяется на данные, которые мы обрабатываем как оператор при использовании вами Сервиса. Она не регулирует обработку данных независимыми организаторами мероприятий в их собственных целях; организаторы могут предоставлять отдельные уведомления, действуя как операторы.",
      ],
    },
    {
      title: "3. Какие данные мы собираем",
      paragraphs: [
        "В зависимости от использования Сервиса могут обрабатываться:",
      ],
      list: [
        "Данные учётной записи: имя, адрес электронной почты (если указан), хэш пароля, имя пользователя, биография, URL аватара, предпочитаемый язык, роль и связанные метаданные.",
        "Данные, связанные с Telegram: при использовании авторизации через Telegram — идентификаторы пользователя Telegram и одноразовые коды, необходимые для регистрации или входа.",
        "Данные о мероприятиях и регистрации: названия, описания, расписание, локации, ссылки, обложки, вместимость, вопросы и ответы при регистрации, идентификаторы организаторов.",
        "Технические данные: IP-адрес, тип устройства и браузера, приблизительное местоположение по IP, метки времени, файлы cookie или аналоги, диагностические журналы.",
        "Обращения: сообщения, которые вы нам отправляете (например в поддержку).",
      ],
    },
    {
      title: "4. Источники данных",
      paragraphs: [
        "Данные поступают от вас (формы, загрузки, настройки), автоматически при использовании Сервиса (журналы, cookie), а также в отдельных случаях от третьих сторон (например Telegram при выбранной интеграции).",
      ],
    },
    {
      title: "5. Цели и правовые основания (справочно для ЕЭЗ/Великобритании)",
      paragraphs: [
        "Где применяется GDPR или UK GDPR, мы можем опираться на следующие основания:",
      ],
      list: [
        "Исполнение договора: предоставление учётных записей, мероприятий, регистрации и запрошенных функций.",
        "Законные интересы: безопасность Сервиса, предотвращение злоупотреблений, улучшение функциональности, агрегированная аналитика, операционные уведомления — с балансом ваших прав.",
        "Согласие: где мы запрашиваем согласие (например на необязательные маркетинговые cookie), его можно отозвать.",
        "Законное обязательство: исполнение требований закона, судов и регуляторов.",
      ],
    },
    {
      title: "6. Как мы используем данные",
      paragraphs: [
        "Мы используем персональные данные для ведения учётных записей; публикации и управления мероприятиями; обработки заявок на участие и отображения информации участников организаторам в нужном объёме; работы аутентификации (включая опциональные сценарии с Telegram); персонализации языка и интерфейса; применения Условий использования; выявления мошенничества и инцидентов безопасности; соблюдения закона; улучшения Сервиса с использованием обезличенной или агрегированной аналитики, где это возможно.",
      ],
    },
    {
      title: "7. Передача и субподрядчики",
      paragraphs: [
        "Мы передаём данные поставщикам услуг (хостинг, база данных, доставка контента, почта, аналитика, хранение файлов). Они обрабатывают данные по нашим инструкциям и при соответствующих гарантиях.",
        "Раскрытие возможно по требованию закона, для защиты прав и безопасности, а также при слиянии, поглощении или продаже активов — с учётом применимого права.",
        "Публичные профили и страницы мероприятий видны посетителям по замыслу Сервиса. Организаторы видят данные регистрации по своим мероприятиям в объёме, необходимом для проведения мероприятий.",
      ],
    },
    {
      title: "8. Трансграничная передача",
      paragraphs: [
        "Данные могут обрабатываться и храниться в странах, отличных от страны вашего проживания. При необходимости применяются меры, такие как стандартные договорные положения, одобренные надзорными органами.",
      ],
    },
    {
      title: "9. Срок хранения",
      paragraphs: [
        "Мы храним данные столько, сколько нужно для работы Сервиса, исполнения обязанностей по закону, разрешения споров и применения соглашений. Данные учётной записи обычно хранятся до удаления аккаунта или удаления нами в соответствии с политикой. Записи о мероприятиях и регистрациях могут храниться период, необходимый организаторам, для соблюдения закона и разрешения споров. Технические журналы — обычно короче, если иное не требуется для безопасности.",
      ],
    },
    {
      title: "10. Безопасность",
      paragraphs: [
        "Мы применяем технические и организационные меры, соответствующие риску: контроль доступа, шифрование при передаче в рамках типовых веб-практик, безопасная работа с учётными данными. Абсолютную безопасность гарантировать нельзя.",
      ],
    },
    {
      title: "11. Ваши права",
      paragraphs: [
        "В зависимости от региона вы можете иметь право на доступ, исправление, удаление, ограничение обработки, возражение, переносимость данных и отзыв согласия, где обработка основана на согласии. Вы можете подать жалобу в надзорный орган.",
        "Для реализации прав свяжитесь с нами способом, указанным на Сервисе. Мы можем запросить подтверждение личности. Срок ответа — в соответствии с применимым законом.",
      ],
    },
    {
      title: "12. Файлы cookie и аналогичные технологии",
      paragraphs: [
        "Мы используем cookie и аналоги для работы Сервиса (сессия, безопасность), настроек (тема, язык) и при необходимости для аналитики. Управление — через настройки браузера; отключение части cookie может ограничить функциональность.",
      ],
    },
    {
      title: "13. Дети",
      paragraphs: [
        "Сервис не рассчитан на детей младше возраста, с которого в их юрисдикции допускается самостоятельное согласие без родителей. Если вы считаете, что мы получили данные ребёнка неправомерно, сообщите нам — мы предпримем шаги.",
      ],
    },
    {
      title: "14. Изменения Политики",
      paragraphs: [
        "Мы можем обновлять Политику. Актуальная версия размещается на Сервисе с указанием даты вступления в силы. О существенных изменениях можем сообщить дополнительно, где это уместно.",
      ],
    },
    {
      title: "15. Контакты",
      paragraphs: [
        "По вопросам конфиденциальности свяжитесь с нами через контакты на Сервисе. При появлении отдельного e-mail для privacy замените этот абзац на актуальный адрес.",
      ],
    },
  ],
};

export function getPrivacyDocument(language: AppLanguage): LegalDoc {
  return language === AppLanguage.RU ? RU : EN;
}
