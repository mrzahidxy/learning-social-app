declare module 'sanitize-html' {
	import type { HtmlParser2Options } from 'htmlparser2';

	export interface IOptions {
		allowedTags?: string[] | false;
		allowedAttributes?: Record<string, string[]>;
		allowedSchemes?: string[];
		allowedSchemesAppliedToAttributes?: string[];
		allowProtocolRelative?: boolean;
		transformTags?: Record<
			string,
			| string
			| ((
					tagName: string,
					attribs: Record<string, string>
			  ) => { tagName: string; attribs: Record<string, string> })
		>;
		parser?: HtmlParser2Options;
	}

	export default function sanitizeHtml(dirty: string, options?: IOptions): string;
}
