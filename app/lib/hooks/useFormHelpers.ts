import { useCallback } from 'react';
import type { HomeMessages, Locale, ProductsNamespaceSchema } from '@/app/lib/i18n';
import { VALIDATION_RULES, validateEmail, validatePhone } from '@/app/lib/validation';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type ContactValidationResult = {
  error?: string;
  sanitized?: ContactFormState;
};

type CommentDraft = {
  rating: number;
  text: string;
  author: string;
  email: string;
};

type CommentValidationResult = {
  error?: string;
  sanitized?: CommentDraft;
};

type ReplyValidationResult = {
  error?: string;
  sanitized?: string;
};

export function useContactValidation(contact: HomeMessages['contact']) {
  return useCallback(
    (
      state: ContactFormState,
      options: { captchaEnabled: boolean; captchaToken?: string | null },
    ): ContactValidationResult => {
      const trimmedName = state.name.trim();
      const trimmedEmail = state.email.trim();
      const trimmedPhone = state.phone.trim();
      const trimmedMessage = state.message.trim();

      if (
        trimmedName.length < VALIDATION_RULES.name.minLength ||
        trimmedName.length > VALIDATION_RULES.name.maxLength
      ) {
        return { error: contact.form.errorName };
      }

      if (
        trimmedEmail.length < VALIDATION_RULES.email.minLength ||
        trimmedEmail.length > VALIDATION_RULES.email.maxLength ||
        !validateEmail(trimmedEmail)
      ) {
        return { error: contact.form.errorEmail };
      }

      if (
        trimmedPhone &&
        (trimmedPhone.length < VALIDATION_RULES.phone.minLength ||
          trimmedPhone.length > VALIDATION_RULES.phone.maxLength ||
          !validatePhone(trimmedPhone))
      ) {
        return { error: contact.form.errorPhone };
      }

      if (trimmedMessage.length < 10) {
        return { error: contact.form.errorMessage };
      }

      if (options.captchaEnabled && !options.captchaToken) {
        return { error: contact.form.captchaRequired };
      }

      return {
        sanitized: {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          message: trimmedMessage,
        },
      };
    },
    [contact.form],
  );
}

export function useCommentValidation(messages: ProductsNamespaceSchema['comments']) {
  const validateComment = useCallback(
    (draft: CommentDraft): CommentValidationResult => {
      const trimmedAuthor = draft.author.trim();
      const trimmedEmail = draft.email.trim();
      const trimmedText = draft.text.trim();

      if (!trimmedAuthor || !trimmedEmail || !trimmedText) {
        return { error: messages.validationError };
      }

      if (!validateEmail(trimmedEmail)) {
        return { error: messages.invalidEmail };
      }

      if (trimmedText.length < VALIDATION_RULES.comment.minLength) {
        return { error: messages.tooShort };
      }

      return {
        sanitized: {
          rating: draft.rating,
          author: trimmedAuthor,
          email: trimmedEmail,
          text: trimmedText,
        },
      };
    },
    [messages.invalidEmail, messages.tooShort, messages.validationError],
  );

  const validateReply = useCallback(
    (reply: string): ReplyValidationResult => {
      const trimmedReply = reply.trim();
      if (!trimmedReply) {
        return { error: messages.emptyReply };
      }

      if (trimmedReply.length < 10) {
        return { error: messages.tooShort };
      }

      if (trimmedReply.length > 2000) {
        return { error: 'Reply is too long.' };
      }

      return { sanitized: trimmedReply };
    },
    [messages.emptyReply, messages.tooShort],
  );

  return { validateComment, validateReply };
}

export function useLocalizedDateFormatter(locale: Locale) {
  return useCallback(
    (isoDate: string) => new Date(isoDate).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US'),
    [locale],
  );
}
