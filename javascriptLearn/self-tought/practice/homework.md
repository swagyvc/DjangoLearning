# 🟢 Beginner

## 1. Greeting App

**Requirements:**

* Input for a name.
* Button labeled "Greet".
* Display:

  * `"Hello, Thai!"`

**Bonus:**

* If the input is empty, display:

  * `"Please enter your name."`

**Concepts:**

* `.value`
* `if/else`
* `.textContent`

---

## 2. Age Checker

Input:

```text
Enter age:
```

Output:

* Under 18 → "Minor"
* 18–64 → "Adult"
* 65+ → "Senior"

**Concepts:**

* Comparisons
* `if`, `else if`, `else`

---

## 3. Even or Odd

User enters:

```text
17
```

Output:

```text
17 is Odd
```

**Hint:**

Use the remainder operator:

```js
%
```

---

## 4. Temperature Converter

Input:

```text
30
```

Buttons:

* Celsius → Fahrenheit
* Fahrenheit → Celsius

Practice:

* Math
* Functions

---

# 🟡 Intermediate

## 5. BMI Calculator

Inputs:

* Height
* Weight

Display:

* BMI
* Underweight
* Normal
* Overweight

---

## 6. Multiplication Table

Input:

```text
5
```

Display:

```text
5 × 1 = 5
5 × 2 = 10
...
5 × 10 = 50
```

You'll learn:

* `for` loops

---

## 7. Dice Roller 🎲

Button:

```text
Roll
```

Display:

```text
4
```

Bonus:

Show:

⚀ ⚁ ⚂ ⚃ ⚄ ⚅

---

## 8. Rock Paper Scissors

User chooses:

* Rock
* Paper
* Scissors

Computer randomly chooses.

Display:

* You win
* You lose
* Draw

Practice:

* Random numbers
* Functions
* Logic

---

# 🟠 Arrays

## 9. Shopping List

Features:

* Add item
* Display all items

Bonus:

Delete an item.

Example:

```text
Milk
Eggs
Bread
```

---

## 10. Student List

Add students:

```text
Alice
Bob
John
```

Display:

```text
1. Alice
2. Bob
3. John
```

Practice:

* Arrays
* Loops

---

# 🔵 Objects

## 11. Simple Bank

Start with:

```js
let account = {
    owner: "Thai",
    balance: 500
};
```

Buttons:

* Deposit
* Withdraw
* Check Balance

This is very similar to backend business logic.

---

## 12. Library

Each book:

```js
{
    title: "",
    author: "",
    borrowed: false
}
```

Features:

* Add
* Borrow
* Return

---

# 🔴 Functions

Create functions:

```js
add()
subtract()
multiply()
divide()
```

Don't use buttons yet.

Call them from JavaScript.

Example:

```js
console.log(add(5, 10));
```

---

# ⚫ Logic Challenge

Build a Number Guessing Game.

Requirements:

* Random number from 1–100.
* User guesses.
* Show:

  * Too high
  * Too low
  * Correct

Bonus:

Count the number of guesses.

---

# ⭐ My recommendation

If I were mentoring you toward becoming a Node.js backend developer, I'd have you build these in order:

1. Greeting App
2. Age Checker
3. Even/Odd Checker
4. Number Guessing Game
5. BMI Calculator
6. Shopping List
7. Student List
8. Bank Account
9. Library Manager
10. Task Manager

Those projects naturally introduce the concepts you'll rely on later: variables, conditionals, loops, arrays, objects, and functions.

### One rule to accelerate your learning

For every project, write down the functions you think you'll need **before** writing any code.

For example, a Number Guessing Game might start with:

```js
function generateRandomNumber() {}
function checkGuess() {}
function displayMessage() {}
function resetGame() {}
```

Thinking in terms of small, focused functions is a habit that translates directly to writing clean backend services and APIs.