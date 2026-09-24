/** Field and copy shapes for LeadForm, shared by the content files that configure it. */
export type LeadOption = { value: string; label: string };

type FieldBase = { name: string; label: string; required?: boolean; hint?: string; wide?: boolean };

export type LeadField =
  | (FieldBase & { type: "text" | "email"; placeholder?: string; autocomplete?: string; maxlength?: number })
  | (FieldBase & { type: "select"; options: LeadOption[]; value?: string; query?: string })
  | (FieldBase & { type: "textarea"; placeholder?: string; rows?: number; maxlength?: number });

/** Copy shared by every lead form on the site. */
export type LeadFormUi = {
  busy: string;
  optional: string;
  honeypot: string;
  /** Small print under the button; `link` becomes a link to the privacy page */
  privacy: { text: string; link: string };
  failure: { title: string; body: string };
  /** Messages for the API's error codes, plus `network` for a failed request */
  errors: Record<"invalid" | "rate_limited" | "payload_too_large" | "server_error" | "network", string>;
};

/** Copy specific to one form. */
export type LeadFormCopy = {
  fields: LeadField[];
  submit: string;
  success: { title: string; body: string; again: string };
};
