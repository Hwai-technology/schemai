import * as assert from 'assert';
import { QueryBuilder } from '../../search/queryBuilder';

describe('HU-07 T2: QueryBuilder Representative Fragments', () => {
    it('builds the query from the 3 most representative lines (no braces, blank lines, or comments)', () => {
        const snippet = `
            // Single-line comment that must be ignored
            /* Block comment that must be ignored */
            
            {
                const x = 1;
                const configurationManager = initializeSystemConfiguration(defaultOptions);
                const authenticationHeader = buildBearerAuthorizationHeader(secretToken);
                const normalizedRepositoryResponse = transformGitHubSearchPayload(rawItems);
                return x;
            }
        `;

        const query = QueryBuilder.buildRepresentativeQuery(snippet);

        // Must exclude comments and standalone braces
        assert.strictEqual(query.includes('comment'), false, 'Should not include comments');
        assert.strictEqual(query.includes('{'), false, 'Should not include braces');
        assert.strictEqual(query.includes('}'), false, 'Should not include braces');

        // Must contain the 3 most representative (longest/most substantial) lines
        assert.ok(query.includes('initializeSystemConfiguration'), 'Missing top representative line 1');
        assert.ok(query.includes('buildBearerAuthorizationHeader'), 'Missing top representative line 2');
        assert.ok(query.includes('transformGitHubSearchPayload'), 'Missing top representative line 3');

        // Must NOT include the 4th/5th short lines ("const x = 1;" or "return x;")
        assert.strictEqual(query.includes('const x = 1'), false, 'Should only pick top 3 lines');
    });

    it('contains no hard-coded Shotcut signatures and works dynamically on arbitrary code', () => {
        const customSnippet = `
            function calculateInvoiceTotal(subtotalAmount: number, taxRatePercentage: number) {
                const computedTaxValue = subtotalAmount * (taxRatePercentage / 100);
                const finalDiscountedInvoiceTotal = subtotalAmount + computedTaxValue - promotionalRebate;
                return finalDiscountedInvoiceTotal;
            }
        `;

        const query = QueryBuilder.buildRepresentativeQuery(customSnippet);
        assert.ok(query.length > 0, 'Query should not be empty');
        assert.strictEqual(query.toLowerCase().includes('shotcut'), false, 'Must not contain hard-coded Shotcut terms');
        assert.ok(query.includes('finalDiscountedInvoiceTotal'), 'Should dynamically extract from input');
    });
});