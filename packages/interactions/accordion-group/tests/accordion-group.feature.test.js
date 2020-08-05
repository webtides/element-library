/* eslint-disable no-unused-expressions */
import { fixture, defineCE, assert, oneEvent, nextFrame } from '@open-wc/testing';
import { define } from '@webtides/accordion-group';
define();

describe('Feature | AccordionGroupe', () => {
	it('can connect without errors', async () => {
		const el = await fixture(`<accordion-groupe></accordion-groupe>`);
		await nextFrame();
	});
});
