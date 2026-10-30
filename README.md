# Amelia's Flowers & Decor — Website + Admin

This is a static website designed for GitHub Pages. The public storefront and admin page each contain their CSS internally in a `<style>` block, so the pages do not depend on an external CSS file. Supabase provides the product database, image storage and admin sign-in when configured.

## What works

- Soft blush-pink, cream and floral boutique styling with responsive layouts.
- Internal CSS is embedded directly in `index.html` and `admin.html`.

- Responsive website navigation and all section links.
- Product enquiry buttons open WhatsApp with the product name.
- Enquiry form builds a WhatsApp message from the visitor's details.
- New Arrivals section is populated from products marked **New arrival** in the admin.
- Admin can add, edit, publish/hide, mark as new, and delete products.
- Admin can upload product images (up to 5 MB).
- Admin can update the displayed phone, WhatsApp and email details.
- Public visitors can view published products but cannot manage them.

## 1. Create the Supabase project

1. Go to https://supabase.com and create a project.
2. Open **SQL Editor → New query**.
3. Paste all of `supabase-setup.sql` and run it.
4. Open **Project Settings → API** (or API Keys) and copy the Project URL and anon/public key.
5. Open `config.js` and replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY`.
6. Set the correct WhatsApp number in international format, without `+` or spaces. Example Kenya: `2547XXXXXXXX`.
7. Set the public phone and email in the same config file.

Never put the Supabase `service_role` key in this website. Use only the anon/public key.

## 2. Create your admin login

1. In Supabase, open **Authentication → Users → Add user**.
2. Create the owner's email and a strong password. Confirm the user if Supabase asks.
3. Do not enable public sign-ups. The site has no public registration form.
4. Open `admin.html` on your deployed site and sign in with that account.

The SQL policies permit signed-in users to manage products. For a single-owner store, only create the owner's account and do not share it. If you later need staff roles, add a dedicated admin-role table and policies before creating staff accounts.

## 3. Deploy on GitHub Pages

1. Upload the complete contents of this folder to the root of your GitHub repository (the `index.html` file must be in the repository root).
2. Commit and push.
3. In GitHub, open **Settings → Pages** and select the branch/folder you deploy from.
4. Wait for the deployment, then visit the public website.
5. Admin page: `https://YOUR-DOMAIN/admin.html`.

In Supabase, open **Authentication → URL Configuration** and add your website URL to the Site URL and Redirect URLs, for example:
- `https://your-domain.com`
- `https://your-domain.com/**`

## 4. Add and manage new arrivals

1. Open `/admin.html` and sign in.
2. Use **Add a product** to enter a name and description, optional price and category, and upload an image.
3. Tick **Mark as a new arrival** for it to appear in the New Arrivals section.
4. Tick **Show on website** to publish it.
5. Press **Save product**. The public website reads the new product from Supabase automatically.

To remove a product from public view without deleting it, choose **Hide**. To permanently remove it, choose **Delete**.

## Important notes

- GitHub Pages is static hosting. The admin database and secure login are provided by Supabase; GitHub alone cannot securely save product updates from a website admin panel.
- Existing product cards are used as temporary demo content only when Supabase is not configured. Once Supabase is configured, products come from the database.
- The contact phone and WhatsApp values currently mirror the numbers in the supplied HTML. Confirm and change them in `config.js` and then in Admin → Store information.
- The website's enquiry form opens WhatsApp; it does not silently send messages or collect visitor information into a database.
- Test the admin sign-in, add/edit/hide/delete actions, image upload, new arrivals and WhatsApp links before sharing the site publicly.
