import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { IOptions } from 'sanitize-html';

const ALLOWED_TAGS = [
	'p',
	'br',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'ul',
	'ol',
	'li',
	'blockquote',
	'pre',
	'code',
	'em',
	'strong',
	'a',
	'hr'
];

const ALLOWED_ATTRIBUTES: IOptions['allowedAttributes'] = {
	a: ['href', 'name', 'target', 'rel'],
	code: ['class']
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

export const renderMarkdownToSafeHtml = (markdown: string | null | undefined) => {
	if (!markdown?.trim()) {
		return '';
	}

	const html = marked.parse(markdown, { async: false });

	return sanitizeHtml(html, {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: ALLOWED_ATTRIBUTES,
		allowedSchemes: ALLOWED_SCHEMES,
		allowedSchemesAppliedToAttributes: ['href'],
		allowProtocolRelative: false,
		transformTags: {
			a: (_tagName, attribs) => ({
				tagName: 'a',
				attribs: {
					...attribs,
					target: '_blank',
					rel: 'noopener noreferrer nofollow'
				}
			})
		}
	});
};

export const stripMarkdownForExcerpt = (markdown: string | null | undefined, maxLength = 160) => {
	const text = (markdown ?? '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
		.replace(/[#>*_~-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!text) {
		return '';
	}

	return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};
