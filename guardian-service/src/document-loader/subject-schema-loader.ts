import { Schema } from '@entity/schema';
import { getMongoRepository } from 'typeorm';
import { ISchema } from '@guardian/interfaces';
import { SchemaLoader } from '@hedera-modules';

/**
 * Subject schema loader
 */
export class SubjectSchemaLoader extends SchemaLoader {
    constructor(
        private readonly context: string
    ) {
        super();
    }

    /**
     * Has context
     * @param context
     * @param iri
     * @param type
     */
    public async has(context: string | string[], iri: string, type: string): Promise<boolean> {
        if (type !== 'subject') {
            return false;
        }
        if (Array.isArray(context)) {
            for (const element of context) {
                if (element.startsWith(this.context) || element.startsWith('schema#')) {
                    return true;
                }
            }
        } else {
            return context && (context.startsWith(this.context) || context.startsWith('schema#'));
        }
        return false;
    }

    /**
     * Get document
     * @param context
     * @param iri
     * @param type
     */
    public async get(context: string | string[], iri: string, type: string): Promise<any> {
        const _iri = '#' + iri;
        const _context = Array.isArray(context) ? context : [context];
        const schemas = await this.loadSchemaContexts(_context, _iri);

        if (!schemas || !schemas.length) {
            throw new Error(`Schema not found: ${_context.join(',')}, ${_iri}`);
        }

        const schema = schemas[0];

        if (!schema.document) {
            throw new Error('Document not found');
        }

        return schema.document;
    }

    /**
     * Load schema contexts
     * @param context
     * @private
     */
    private async loadSchemaContexts(context: string[], iri: string): Promise<ISchema[]> {
        try {
            if (context && context.length) {
                for (const c of context) {
                    if (c.startsWith('schema#')) {
                        return await getMongoRepository(Schema).find({ iri });
                    }
                }
                return await getMongoRepository(Schema).find({
                    where: {
                        contextURL: { $in: context },
                        iri: { $eq: iri },
                    }
                });
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
}
