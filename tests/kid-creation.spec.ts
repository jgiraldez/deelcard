import { test, expect } from '@playwright/test';

test.describe('Kid Creation Form', () => {
  test('should display add kid form', async ({ page }) => {
    await page.goto('/kids/add');

    // Form should be visible
    await expect(page.getByRole('heading', { name: /Add a Child/i })).toBeVisible();
    await expect(page.getByLabel(/Child's Name/i)).toBeVisible();
    await expect(page.getByLabel(/Age/i)).toBeVisible();
    await expect(page.getByLabel(/4-Digit PIN/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Child/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Cancel/i })).toBeVisible();
  });

  test('should require child name', async ({ page }) => {
    await page.goto('/kids/add');

    // Try to submit without name
    await page.getByRole('button', { name: /Add Child/i }).click();

    // HTML5 validation should prevent submission
    const nameInput = page.getByLabel(/Child's Name/i);
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should validate name max length', async ({ page }) => {
    await page.goto('/kids/add');

    const nameInput = page.getByLabel(/Child's Name/i);
    await expect(nameInput).toHaveAttribute('maxlength', '100');
  });

  test('should validate age range', async ({ page }) => {
    await page.goto('/kids/add');

    const ageInput = page.getByLabel(/Age/i);
    await expect(ageInput).toHaveAttribute('min', '1');
    await expect(ageInput).toHaveAttribute('max', '18');
  });

  test('should validate PIN format', async ({ page }) => {
    await page.goto('/kids/add');

    const pinInput = page.getByLabel(/4-Digit PIN/i);
    await expect(pinInput).toHaveAttribute('maxlength', '4');
    await expect(pinInput).toHaveAttribute('pattern', '\\d{4}');
  });

  test('should navigate back to dashboard on cancel', async ({ page }) => {
    await page.goto('/kids/add');

    await page.getByRole('link', { name: /Cancel/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should have Back to Dashboard link', async ({ page }) => {
    await page.goto('/kids/add');

    const backLink = page.getByRole('link', { name: /Back to Dashboard/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should accept valid form submission with all fields', async ({ page }) => {
    await page.goto('/kids/add');

    await page.getByLabel(/Child's Name/i).fill('Test Child');
    await page.getByLabel(/Age/i).fill('10');
    await page.getByLabel(/4-Digit PIN/i).fill('1234');

    // Note: This will fail without authentication, but validates form structure
    await page.getByRole('button', { name: /Add Child/i }).click();

    // Should show loading state
    await expect(page.getByRole('button', { name: /Adding Child/i })).toBeVisible();
  });

  test('should accept valid form submission with only required fields', async ({ page }) => {
    await page.goto('/kids/add');

    await page.getByLabel(/Child's Name/i).fill('Test Child');

    // Note: This will fail without authentication, but validates form structure
    await page.getByRole('button', { name: /Add Child/i }).click();

    // Should show loading state
    await expect(page.getByRole('button', { name: /Adding Child/i })).toBeVisible();
  });
});
