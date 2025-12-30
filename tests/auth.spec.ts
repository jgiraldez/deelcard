import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Sign in to your account/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: /DealCard/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Up/i })).toBeVisible();
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /Sign up/i }).click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');

    await page.getByRole('link', { name: /Sign in/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Sign In/i }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/Email/i);
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should show validation error for empty password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/Email/i).fill('test@example.com');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // HTML5 validation should prevent submission
    const passwordInput = page.getByLabel(/Password/i);
    await expect(passwordInput).toHaveAttribute('required');
  });
});
