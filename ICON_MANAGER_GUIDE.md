# Category-Based Icon Manager Guide

## How It Works

The Icon Manager now uses a **Category-Based System**:

1. **Only Categories are shown** in the Icon Manager
2. **When you update a category icon**, ALL services in that category automatically get that same icon
3. **No manual service updates needed** - it's fully automated
4. **Users see icons instantly** across their dashboard

## Step-by-Step Usage

### Update an Icon

1. Go to **Admin Panel → Icon Manager**
2. Find your category (e.g., "Instagram")
3. Paste your GIF URL from Vercel Blob
4. Click **"Update Icon"**
5. ✓ Done! The category icon and all services in it are now updated

### Delete an Icon

1. Go to **Icon Manager**
2. Click the **red trash button** on any category
3. ✓ Icon is removed from the category AND all its services

### What Gets Updated Automatically

When you update an Instagram category icon:
- ✓ Instagram category gets the icon
- ✓ Instagram Followers service gets the icon
- ✓ Instagram Likes service gets the icon
- ✓ Instagram Comments service gets the icon
- ✓ ALL other Instagram services get the icon
- ✓ Users see the icon immediately in cards, tabs, dropdowns, orders

## Icon Display Locations

Once set, category icons appear in:
- Service cards
- Category tabs
- Service dropdowns
- Order dialogs
- Recent orders list
- Order history table
- Admin dashboard

## GIF URL Format

Your URL should look like:
```
/images/icons8-instagram.gif
```

## Troubleshooting

**Icon not showing?**
- Check if URL is copied correctly
- Make sure it ends with `.gif`
- Click "Update Icon" button (not Enter key)

**Same icon for all categories?**
- This is normal if you copy-pasted the same URL
- Use different GIF URLs for each category

**Users not seeing the update?**
- The app auto-refreshes the data
- If not, user should refresh their browser

## Tips

- Upload GIFs to Vercel Blob first (drag and drop)
- Copy the CDN URL from Blob storage
- Test preview before updating
- Use 100x100px or 200x200px GIFs for best quality
