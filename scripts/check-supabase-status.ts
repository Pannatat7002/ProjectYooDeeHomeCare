import fs from 'fs';
import path from 'path';

// Parse .env.local manually first
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

async function checkSupabase() {
    const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');
    console.log('Checking Supabase connection...');
    console.log('Configured:', isSupabaseConfigured());
    console.log('Supabase URL:', process.env.CONFIG_NEXT_PUBLIC_SUPABASE_URL);

    const tables = [
        'care_centers',
        'consultations',
        'contacts',
        'blogs',
        'admins',
        'ads',
        'traffic',
        'provider_signups'
    ];

    for (const table of tables) {
        const { count, error } = await supabaseAdmin
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Table "${table}": Error - ${error.message}`);
        } else {
            console.log(`✅ Table "${table}": ${count} rows`);
        }
    }
}

checkSupabase().catch(console.error);
