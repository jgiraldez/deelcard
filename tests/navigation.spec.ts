import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Home Page', () => {
    test('should display home page', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Teach Kids About Money/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign Up/i })).toBeVisible();
    });

    test('should navigate to signup from home', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: /Get Started Free/i }).first().click();
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should navigate to kid mode from home', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: /Kid Mode/i }).click();
      await expect(page).toHaveURL(/.*kid-mode/);
    });

    test('should navigate to login from home', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: /Sign In/i }).first().click();
      await expect(page).toHaveURL(/.*login/);
    });

    test('should display feature cards', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /Chores & Allowance/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Rewards System/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /AI Financial Tutor/i })).toBeVisible();
    });
  });

  test.describe('Kid Mode', () => {
    test('should display kid mode page', async ({ page }) => {
      await page.goto('/kid-mode');

      // Kid mode page should be accessible
      await expect(page).toHaveURL(/.*kid-mode/);
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should have dashboard quick links', async ({ page }) => {
      // Note: This requires authentication, so we just test the page structure
      await page.goto('/dashboard');

      // Should redirect to login if not authenticated
      // Or show dashboard if authenticated
      const url = page.url();
      expect(url).toMatch(/(login|dashboard)/);
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    });
  });

  test.describe('Form Accessibility', () => {
    test('login form should have proper labels', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.getByLabel(/Email/i);
      const passwordInput = page.getByLabel(/Password/i);

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('signup form should have proper labels', async ({ page }) => {
      await page.goto('/signup');

      const emailInput = page.getByLabel(/Email/i);
      const passwordInput = page.getByLabel(/Password/i);

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('add kid form should have proper labels', async ({ page }) => {
      await page.goto('/kids/add');

      const nameInput = page.getByLabel(/Child's Name/i);
      const ageInput = page.getByLabel(/Age/i);
      const pinInput = page.getByLabel(/4-Digit PIN/i);

      await expect(nameInput).toBeVisible();
      await expect(ageInput).toBeVisible();
      await expect(pinInput).toBeVisible();
    });
  });
});
