import fs from 'fs';
import path from 'path';

// 1. Load environment variables from .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    let val = trimmed.slice(eqIdx + 1).trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
} catch (e) {
    console.warn('Could not read .env.local:', e);
}

async function updateStatusByUtm() {
    console.log('===========================================================');
    console.log('🔄 Updating care_centers status: No utm_source -> "hidden"');
    console.log('===========================================================');

    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured properly in .env.local');
    }

    // 1. Fetch care centers with pagination
    console.log('Fetching all care centers...');
    let allCenters: any[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabaseAdmin
            .from('care_centers')
            .select('id, name, status, utm_source')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error('Error fetching care_centers:', error.message);
            break;
        }
        if (!data || data.length === 0) break;
        allCenters = allCenters.concat(data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    console.log(`Total care centers found: ${allCenters.length}`);

    // 2. Identify centers without utm_source that need status = 'hidden'
    const toUpdateHidden: any[] = [];
    let alreadyHidden = 0;
    let hasUtmCount = 0;

    for (const c of allCenters) {
        const utm = (c.utm_source || '').trim();
        if (!utm) {
            // No utm_source
            if (c.status !== 'hidden') {
                toUpdateHidden.push(c);
            } else {
                alreadyHidden++;
            }
        } else {
            hasUtmCount++;
        }
    }

    console.log(`\nAnalysis:`);
    console.log(` - Centers with utm_source: ${hasUtmCount}`);
    console.log(` - Centers without utm_source (already hidden): ${alreadyHidden}`);
    console.log(` - Centers without utm_source (need update to "hidden"): ${toUpdateHidden.length}`);

    if (toUpdateHidden.length === 0) {
        console.log('\n✅ All centers without utm_source are already set to "hidden". No update needed.');
        return;
    }

    console.log(`\nUpdating ${toUpdateHidden.length} centers in batches...`);
    const BATCH_SIZE = 100;
    let updatedCount = 0;

    for (let i = 0; i < toUpdateHidden.length; i += BATCH_SIZE) {
        const batchIds = toUpdateHidden.slice(i, i + BATCH_SIZE).map(c => c.id);

        const { error } = await supabaseAdmin
            .from('care_centers')
            .update({ status: 'hidden' })
            .in('id', batchIds);

        if (error) {
            console.error(`❌ Error updating batch ${i} - ${i + batchIds.length}:`, error.message);
        } else {
            updatedCount += batchIds.length;
            process.stdout.write(`   Progress: ${updatedCount} / ${toUpdateHidden.length}\r`);
        }
    }

    console.log(`\n\n✅ Successfully updated ${updatedCount} care centers to status "hidden".`);
    console.log('===========================================================\n');
}

updateStatusByUtm().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
