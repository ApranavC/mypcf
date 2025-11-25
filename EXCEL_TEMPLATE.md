# Excel Template Guide

## Required Columns

Your Excel file should have the following columns (column names are case-insensitive):

| Column Name | Alternative Names | Description | Example |
|------------|------------------|-------------|---------|
| Dish | Food, Name | Name of the food item | Chicken Breast |
| Protein | P | Protein in grams **(per 100g)** | 31 |
| Carbs | C | Carbohydrates in grams **(per 100g)** | 0 |
| Fats | F | Fats in grams **(per 100g)** | 3.6 |
| Calories | Cal | Total calories **(per 100g)** | 165 |

## Sample Data

Here's an example of how your Excel file should look:

| Dish | Protein | Carbs | Fats | Calories |
|------|---------|-------|------|----------|
| Chicken Breast | 31 | 0 | 3.6 | 165 |
| Brown Rice (cooked) | 2.6 | 22 | 0.9 | 112 |
| Broccoli | 2.8 | 6 | 0.4 | 35 |
| Salmon | 22 | 0 | 12 | 206 |
| Sweet Potato | 2 | 20 | 0.1 | 86 |
| Greek Yogurt | 10 | 3.6 | 0.4 | 59 |
| Oatmeal | 5 | 27 | 2.5 | 150 |
| Eggs | 6 | 0.6 | 5 | 72 |

## Notes

- **All nutritional values must be per 100 grams**
- When adding meals, you can specify the quantity in grams (e.g., 150g, 200g)
- The app will automatically calculate the exact PCF and calories based on the quantity you enter
- Formula: Actual Value = (Quantity in grams / 100) × Value per 100g
- Example: If chicken breast has 31g protein per 100g, and you eat 150g, you get (150/100) × 31 = 46.5g protein
- Empty rows will be ignored
- Make sure your file is saved as .xlsx or .xls format

