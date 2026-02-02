#!/bin/bash

# Deployment Script for Admin Panel Fixes
# =========================================

echo "🚀 Nextwave SMM Panel - Deployment Script"
echo "=========================================="
echo ""

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "copilot/fix-admin-panel-price-update-issue" ]; then
    echo "⚠️  Warning: You're not on the fix branch!"
    echo "Do you want to checkout the fix branch? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git checkout copilot/fix-admin-panel-price-update-issue
    else
        echo "Exiting..."
        exit 1
    fi
fi

echo "📋 Deployment Options:"
echo ""
echo "1. Deploy to Production with Vercel CLI"
echo "2. Merge to main and let Vercel auto-deploy"
echo "3. Show current status"
echo "4. Exit"
echo ""
echo "Select an option (1-4):"
read -r option

case $option in
    1)
        echo ""
        echo "🚀 Deploying to production with Vercel..."
        echo ""
        
        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo "❌ Vercel CLI not found!"
            echo "Install it with: npm install -g vercel"
            exit 1
        fi
        
        # Deploy to production
        vercel --prod
        
        echo ""
        echo "✅ Deployment initiated!"
        echo "Check Vercel dashboard for status."
        ;;
        
    2)
        echo ""
        echo "🔄 Merging to main branch..."
        echo ""
        
        # Fetch latest
        git fetch origin
        
        # Checkout main
        git checkout main
        git pull origin main
        
        # Merge feature branch
        echo "Merging copilot/fix-admin-panel-price-update-issue into main..."
        git merge copilot/fix-admin-panel-price-update-issue
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Merge successful!"
            echo ""
            echo "Push to origin? (y/n)"
            read -r push_response
            
            if [ "$push_response" = "y" ]; then
                git push origin main
                echo ""
                echo "✅ Pushed to main!"
                echo "Vercel will auto-deploy in 2-3 minutes."
                echo "Check: https://vercel.com/dashboard"
            fi
        else
            echo "❌ Merge failed! Please resolve conflicts manually."
            exit 1
        fi
        ;;
        
    3)
        echo ""
        echo "📊 Current Status:"
        echo "=================="
        echo ""
        
        # Git status
        echo "Git Status:"
        git status
        echo ""
        
        # Latest commits
        echo "Latest Commits:"
        git log --oneline -5
        echo ""
        
        # Check if vercel is configured
        if [ -f "vercel.json" ]; then
            echo "✅ Vercel configuration found"
        else
            echo "⚠️  No vercel.json found"
        fi
        
        echo ""
        echo "Branch: $CURRENT_BRANCH"
        ;;
        
    4)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo "Invalid option!"
        exit 1
        ;;
esac

echo ""
echo "==========================================="
echo "For manual deployment instructions, see:"
echo "  DEPLOYMENT_GUIDE.md"
echo "==========================================="
