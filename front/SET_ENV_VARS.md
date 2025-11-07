# Setting Environment Variables in Cloudflare Pages

## Option 1: Via Dashboard (Recommended)

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **cardiosense**
3. Go to **Settings** → **Environment variables**
4. Click **Add variable** and add:
   - Variable name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://chifwmdrktbewbodsobs.supabase.co`
   - Apply to: **Production** and **Preview**
   
5. Click **Add variable** again:
   - Variable name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaWZ3bWRya3RiZXdib2Rzb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDI1MDUsImV4cCI6MjA3ODAxODUwNX0.w4C2LKtdyDepxmb6ybaLLOeXRDDoXiijcRJ3UOU7hlg`
   - Apply to: **Production** and **Preview**

6. **Save** and **redeploy** your site

## Option 2: Via Wrangler CLI

Run these commands from the `front` directory:

```bash
# For production
wrangler pages project set-env NEXT_PUBLIC_SUPABASE_URL "https://chifwmdrktbewbodsobs.supabase.co" --project-name cardiosense --production

wrangler pages project set-env NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaWZ3bWRya3RiZXdib2Rzb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDI1MDUsImV4cCI6MjA3ODAxODUwNX0.w4C2LKtdyDepxmb6ybaLLOeXRDDoXiijcRJ3UOU7hlg" --project-name cardiosense --production

# For preview
wrangler pages project set-env NEXT_PUBLIC_SUPABASE_URL "https://chifwmdrktbewbodsobs.supabase.co" --project-name cardiosense --preview

wrangler pages project set-env NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaWZ3bWRya3RiZXdib2Rzb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDI1MDUsImV4cCI6MjA3ODAxODUwNX0.w4C2LKtdyDepxmb6ybaLLOeXRDDoXiijcRJ3UOU7hlg" --project-name cardiosense --preview
```

## After Setting Variables

1. Trigger a new deployment by pushing a commit or manually redeploying
2. Wait for the deployment to complete
3. Test the login/signup functionality

## Why This Is Needed

- `.dev.vars` only works locally with `wrangler dev`
- Cloudflare Pages needs environment variables to be configured in the dashboard or via CLI
- Without these variables, the Supabase client can't connect to your database

