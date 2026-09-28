import fs from 'fs';
import path from 'path';

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

async function setAllVisible() {
    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    console.log('Updating care_centers to status = "visible"...');
    const { data, error } = await supabaseAdmin
        .from('care_centers')
        .update({ status: 'visible' })
        .neq('status', 'visible')
        .select('id');

    if (error) {
        console.error('Error updating status:', error.message);
    } else {
        console.log(`✅ Successfully updated ${data?.length || 0} care centers to "visible".`);
    }

    const { count } = await supabaseAdmin
        .from('care_centers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'visible');

    console.log(`Total visible care centers: ${count}`);
}

setAllVisible().catch(console.error);
