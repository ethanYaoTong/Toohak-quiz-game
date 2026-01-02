# COMP1531 Major Project

**✨ 🥜 Toohak 🥜 ✨**

## Contents

[[_TOC_]]

## Change Log
23/10: Remove camelCase requirement from ESlint configuration file.
05/11: Edit ESlint to use the typescript version of `no-unused-vars`.

## 🫡 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 🌈 1. Overview

UNSW has been having severe issues with lecture attendance - students just aren't coming to class, and they're citing that class isn't interesting enough for them.

UNSW must resort to giving into the limited attention span of students and gamify lecture and tutorial time as much as possible - by doing interactive and colourful quizzes.

However, instead of licensing well-built and tested software, UNSW is hoping to use the pool of extremely talented and interesting COMP1531 students to create their own version to distribute around campus for free. The chosen game to "take inspiration from" is **<a href="https://kahoot.com/">Kahoot</a>**.

(For legal reasons, this is a joke).

The 25T3 cohort of COMP1531 students will build the **backend Javascript server** for a new quiz game platform, **Toohak**. We plan to task future students to build the frontend for Toohak, something you won't have to worry about.

**Toohak** is the questionably-named quiz tool that allows admins to create quiz games, and players to join (without signing up) to participate and compete.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

We highly recommend **creating and playing** a Kahoot game to better understand your task:
- To sign up and log in as an admin, go to [kahoot.com](https://kahoot.com/).
- To join a game created by an admin, go to [kahoot.it](https://kahoot.it/).

## 🐭 2. Iteration 0: Getting Started

[You can watch the iteration 0 introductory video here.](https://youtu.be/YhBwRQN--gs) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐭 2.1. Task

This iteration is designed as a warm-up to help you setup your project, learn Git and project management practices (see Marking Criteria), and understand how your team works together.

In this iteration, you are expected to:
1. Write stub code for the basic functionality of Toohak. The basic functionality is defined in the interface section below.
    * A stub is a function declaration and sample return value (see example below). **Do NOT write the implementation** for the stubbed functions. That is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 1** function each.
    * Function stub locations should be inside files specified in the interface section below.
    * Return values should exactly match the interface table below (see example below).
```javascript
// Sample stub for the authLoginV1 function
// Return stub value matches table below
function adminAuthLogin(email, password) {
  return {
    userId: 1,
  }
}
```
2. Design a structure to store all the data needed for Toohak, and place this in the [code block](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) inside the `data.md` file. Specifically, you must consider how to store information about **users** and **quizzes** and populate ONE example `user` and `quiz` in your data structure (any values are fine - see example below).
    * Use the interface table (2.2) to help you decide what data might need to be stored. This will require making some educated guesses about what would be required to be stored in order to return the types of data you see. **Whilst the data structure you describe in data.md might be similar to the interface, it is a different thing to the interface.** If you're still confused, think of the interface like a restaurant menu, and `data.md` like where the food is stored in the back. It's all the same food, but the menu is about how it's packaged up and received from the kitchen, and `data.md` is describing the structure of how it's all stored behind the scenes. 
    * As functions are called, this structure would be populated with more users and quizzes, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents.
```javascript
// Example values inside of a 'user' object might look like this
// NOTE: this object's data is not exhaustive, you may need more/fewer fields stored as you complete this project. 
{
  uId: 1,
  nameFirst: 'Rani',
  nameLast: 'Jiang',
  email: 'ranivorous@gmail.com',
}
```

3. Follow best practices for git and teamwork as discussed in lectures.
    * Create a group contract by completing `contract.md` - you may add/edit this template as you see fit.
    * You are expected to have **at least 1 meeting** with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location *in your repo* (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting). We have provided you with a `minutes-template.md` which you may use if you choose. You must ensure that you at least take note of the attendies, date/time, and assigned tasks.
    * Utilise and familiarize with the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) for your task tracking and allocation. In iteration 0, to get familiar with issue boards you should at least create and assign issues with appropriate titles, make it clear their iteration, and track your progression via labels. Further detail of what is considered "effective use" can be seen in section 7.8.
    * For this iteration each team member will need to make a minimum of **1 merge request (MR) per person** in your group into the `master` branch.
    * **1 merge request per function** must be made (12 in total). Each merge request needs to be approved by a team member that did not create the MR, and merged by the creator.
    * Check out the lab on Git from week 1 to get familiar with using Git.

### 🐭 2.2. Functions to stub

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `userId`, `quizId`.

In terms of file structure:
 * All functions starting with `adminAuth` or `adminUser` go in `auth.js`.
 * All functions starting with `adminQuiz` go in `quiz.js`.
 * `clear` goes in `other.js`.

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  userId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password, return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  userId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's userId, return details about the user.
      <li>"<code>name</code>" is the first and last name concatenated with a single space between them.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ user:
  {
    userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetailsUpdate</code>
      <br /><br />
      Given an admin user's userId and a set of properties, update the properties of this logged in admin user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, email, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
    }
  ]
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, name, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 2
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 1,
  name: 'My Quiz',
  timeCreated: 1683125870,
  timeLastEdited: 1683125871,
  description: 'This is my quiz',
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, name )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>()</code> no parameters
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
</table>

### 🐭 2.3 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>20%</td>
    <td><ul>
      <li>Correct implementation of specified stubs.</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing users and quizzes, inside of <code>data.md</code>.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful, informative and consistent git commit messages and branch names being used (see <a href="https://initialcommit.com/blog/git-commit-messages-best-practices#:~:text=commit%20message%20style.-,General%20Commit%20Message%20Guidelines,-As%20a%20general">examples</a>).</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures). Repeated commit names are avoided.</li>
      <li>At least 1 merge request per person and 1 merge request per function (12 in total) made into the <code>master</code> branch. Each merge request is approved by a team member that did not create the MR. </li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>30%</td>
    <td><ul>
      <li>Completed a high-quality group contract.</li>
      <li>A generally equal contribution between team members.</li>
      <li>Effective and regular use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
      <li>Effective use of Gitlab issue board for task tracking. Individual tasks are assigned to group members and in the correct final state at the conclusion of the iteration. Task summary and description is logical, and the iteration's requirements are accurately represented.</li>
    </ul></td>
  </tr>
</table>

### 🐭 2.4. Dryrun

We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for the automarking component of iteration 0.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 0
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter0.test.cjs
```

### 🐭 2.5. Submission

Please see section 6 for information on **due date**.

## 🐶 3. Iteration 1: Basic Functionality and Tests

[You can watch the iteration 1 introductory video here.](https://youtu.be/hEmdnk39qLg) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐶 3.1. Task

In this iteration, you are expected to:

1. Follow best practices for git, project management, and effective teamwork, as discussed in lectures.
    * The marking will be heavily biased toward how well you follow good practices and work together as a team. Just having a "working" solution at the end is not, on its own, sufficient to even get a passing mark.

    * You need to use the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) for your task tracking and allocation. Spend some time getting to know how to use the taskboard. Further detail of what is considered "effective use" can be seen in section 7.8.
      * You must write <a href="https://www.atlassian.com/work-management/project-management/acceptance-criteria">Acceptance Criteria<a> for each issue prior to completion of the implementation. This will help you plan your tests and edge cases. 

    * You are expected to meet regularly with your group and document the meetings via meeting minutes, which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).

    * You should have regular standups and be able to demonstrate evidence of this to your tutor (at least **2 per week**).

    * For this iteration, you will need to collectively make a minimum of **12 merge requests** into `master`.

2. Write tests for and implement the basic functionality of Toohak. The basic functionality is defined as per the interface section below.
    * Test files you add should all be in the form `*.test.js`.
    * Do NOT attempt to try and write or start a web server. Don't overthink how these functions are meant to connect to a frontend yet. That is for the next iteration. In this iteration you are just focusing on the basic backend functionality.

### 🐶 3.2. Storing data

Nearly all of the functions will likely have to reference some "data source" to store information. E.g. If you register two users, create two quizzes, all of that information needs to be "stored" somewhere. The most important thing for iteration 1 is not to overthink this problem.

Firstly, you should **not** use an SQL database, or something like firebase.

Secondly, you don't need to make anything persist. What that means is that if you run all your tests, and then run them again later, it's OK for the data to be "fresh" each time you run the tests. We will cover persistence in another iteration.

Inside `src/dataStore.js` we have provided you with an object called `data` which will contain the information that you will need to access across multiple functions. An explanation of how to `get` the data is in `dataStore.js`. You will need to determine the internal structure of the object. You are allowed to modify this data structure.

For example, you could define a structure in a file that is empty, and as functions are called, the structure populates and fills up like the one below:

```javascript
let data = {
    users: [
        {
            id: 1,
            nameFirst: 'user1',
        },
        {
            id: 2,
            nameFirst: 'user2',
        },
    ],
    quizzes: [
        {
            id: 1,
            name: 'quiz1',
        },
        {
            id: 2,
            name: 'quiz2',
        },
    ],
}
```
### 🐶 3.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch (using a consistent & informative structure, see section 7.9).
2. Write function stub/s for your feature. This may have been completed in iteration 0 for some functions.
3. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
4. Implement that feature.
5. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
6. Create a merge request for the branch.
7. Get someone in your team who **did not** work on the feature to review the merge request.
8. Fix any issues identified in the review.
9. After merge request is **approved by a different team member, you (the creator) merge** the merge request into `master`.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.js`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature is implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* Merging in merge requests with failing tests is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development, it is something you will be **penalised** for in marking.
* Similarly, merging in branches with untested features is also **bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.
* We encourage you to **write some tests before writing the implementation**. This practice helps ensure your implementation is comprehensively thought out, and will assist you in future iterations.

### 🐶 3.4. Testing guidelines & advice

#### 🐶 3.4.1. Test Structure
The tests you write should be as small and independent as possible. This makes it easier to identify why a particular test may be failing. Similarly, try to make it clear what each test is testing for. Meaningful test names and documentation help with this. An example of how to structure tests has been done in:

* `src/echo.js`
* `src/echo.test.js`

_The echo functionality is tested, both for correct behaviour and for failing behaviour. As echo is relatively simple functionality, only 2 tests are required. For the larger features, you will need many tests to account for many different behaviours._

#### 🐶 3.4.2. Black Box Testing

Your tests should be *black box* tests:
  * Black box means they should not depend on your specific implementation, but rather work with *any* faithful implementation of the project interface specification. I.e. you should design your tests such that if they were run against another group's backend they would still pass.
  * This means you should *not* be importing the `data` object itself or directly accessing it via the `get` functions from `src/dataStore.js` inside your test. As the structure of your data is not specified by the interface, interacting with it through any means other than via the interface functions is not considered black box.
  * This also means you should *not* be testing for specific error message strings, only the error type strings, as they are not specified by the interface.
  * If you wish to write *white box* tests (such as testing smaller units of code like helper functions), please write these tests in a separate folder so that we do not mark them. If you include *white box* tests amongst your *black box* tests without making this clear, we may mark you down.

This will mean you will use code like this to test login, for instance:

```javascript
let result = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
adminAuthLogin('validemail@gmail.com', '123abc!@#'); // Expect to work since we registered
```

#### 🐶 3.4.3. Resetting state

You should reset the state of the application (e.g. deleting all users, quizzes, etc.) at the start of every test. That way you know none of them are accidentally dependent on an earlier test. You can use a function for this that is run at the beginning of each test (hint: `clear`).

#### 🐶 3.4.4. Other help

* If you find yourself needing similar code at the start of a series of tests, consider using Jest's [**beforeEach**](https://jestjs.io/docs/api#beforeeachfn-timeout) to avoid repetition.

Sometimes you may ask "What happens if X?". In cases where we don't specify behaviour, we call this **undefined behaviour**. When something has undefined behaviour, you can have it behave any reasonable way you want - because there is no expectation or assumption of how it should act.

A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 🐶 3.5. Iteration 1 Interface

The functions required for iteration 1 are described below.

All error cases should return <code>{error: '<b>ERROR_TYPE</b>', message: 'specific error message here'}</code>, where the **error type is listed next to the error case**, and the message is anything you like (message will not be marked).

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `userId`, `quizId`.

For timestamps, these are Unix timestamps in seconds. You can find more information that here https://en.wikipedia.org/wiki/Unix_time. Timestamps should be rounded using `Math.floor()`.

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:20%">Data Types</th>
    <th style="width:40%">Error returns</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ userId }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>INVALID_EMAIL</b>
      <ul>
        <li>Email address is used by another user.</li>
        <li>Email does not satisfy this: <a href="https://www.npmjs.com/package/validator">https://www.npmjs.com/package/validator</a> (validator.isEmail function).</li>
      </ul>
      <b>INVALID_FIRST_NAME</b>
      <ul>
        <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameFirst is less than 2 characters or more than 20 characters.</li>
      </ul>
      <b>INVALID_LAST_NAME</b>
      <ul>
        <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameLast is less than 2 characters or more than 20 characters.</li>
      </ul>
      <b>INVALID_PASSWORD</b>
      <ul>
        <li>Password is less than 8 characters.</li>
        <li>Password does not contain at least one number and at least one letter.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ userId }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>INVALID_CREDENTIALS</b>
      <ul>
        <li>Email address does not exist.</li>
        <li>Password is not correct for the given email.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's userId, return details about the user.
      <li>"name" is the first and last name concatenated with a single space between them.</li>
      <li>numSuccessfulLogins includes logins direct via registration, and is counted from the moment of registration starting at 1.</li>
      <li>numFailedPasswordsSinceLastLogin is reset every time they have a successful login, and simply counts the number of attempted logins that failed due to incorrect password, only since the last login.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ user:
  {
    userId,
    name,
    email,
    numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin,
  }
}</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
    </td>
  </tr>
  <tr>
  <td>
    <code>adminUserDetailsUpdate</code>
    <br /><br />
    Given an admin user's userId and a set of properties, update the properties of this logged in admin user.
  </td>
  <td>
    <b>Parameters:</b><br />
    <code>( userId, email, nameFirst, nameLast )</code>
    <br /><br />
    <b>Return type if no error:</b><br />
    <code>{ }</code>
  </td>
  <td>
    <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
    <br />
    <b>UNAUTHORISED</b>
    <ul>
      <li>userId is not a valid user.</li>
    </ul>
    <b>INVALID_EMAIL</b>
    <ul>
      <li>Email is currently used by another user (excluding the current authorised user)</li>
      <li>Email does not satisfy this: <a href="https://www.npmjs.com/package/validator">https://www.npmjs.com/package/validator</a> (validator.isEmail)</li>
    </ul>
    <b>INVALID_FIRST_NAME</b>
    <ul>
      <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameFirst is less than 2 characters or more than 20 characters</li>
    </ul>
    <b>INVALID_LAST_NAME</b>
    <ul>
      <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameLast is less than 2 characters or more than 20 characters</li>
    </ul>
  </td>
  </tr>
  <tr>
  </td>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_OLD_PASSWORD</b>
      <ul>
        <li>Old Password is not the correct old password</li>
      </ul>
      <b>INVALID_NEW_PASSWORD</b>
      <ul>
        <li>Old Password and New Password match exactly</li>
        <li>New Password has already been used before by this user</li>
        <li>New Password is less than 8 characters</li>
        <li>New Password does not contain at least one number and at least one letter</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizzes: [
    {
      quizId,
      name,
    }
  ]
}</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, name, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizId }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_QUIZ_NAME</b>
      <ul>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
      </ul>
      <b>DUPLICATE_QUIZ_NAME</b>
      <ul>
        <li>Name is already used by the current logged in user for another quiz.</li>
      </ul>
      <b>INVALID_DESCRIPTION</b>
      <ul>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_QUIZ_ID</b>
      <ul>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{
  quizId,
  name,
  timeCreated,
  timeLastEdited,
  description,
}</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_QUIZ_ID</b>
      <ul>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, name )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_QUIZ_ID</b>
      <ul>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
      <b>INVALID_QUIZ_NAME</b>
      <ul>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
      </ul>
      <b>DUPLICATE_QUIZ_NAME</b>
      <ul>
        <li>Name is already used by the current logged in user for another quiz.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <code>`{ error: 'ERROR_TYPE', message: 'specific error message here' }`</code> where the error type is:
      <br />
      <b>UNAUTHORISED</b>
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
      <b>INVALID_QUIZ_ID</b>
      <ul>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
      <b>INVALID_DESCRIPTION</b>
      <ul>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
    </td>
  </tr>
</table>


### 🐶 3.6. Authorisation

Elements of securely storing passwords and other tricky authorisation methods are not required for iteration 1. You can simply store passwords plainly, and use the user ID to identify each user. We will discuss ways to improve the quality and methods of these capabilities in the later iterations.

Note that the `userId` variable is simply the user ID of the user who is making the function call. For example,
* A user registers an account with Toohak and is assigned some integer ID, e.g. `42` as their user ID.
* When they make subsequent calls to functions, their user ID - in this case, `42` - is passed in as the `userId` argument.

### 🐶 3.7. Working in parallel

This iteration provides challenges for many groups when it comes to working in parallel. Your group's initial reaction will be that you need to complete registration before you can complete quiz creation, and then quiz creation must be done before you update a quiz name, etc.

There are several approaches that you can consider to overcome these challenges:

* Have people working on down-stream tasks (like the quiz implementation) work with stubbed versions of the up-stream tasks. E.g. The register function is stubbed to return a successful dummy response, and therefore two people can start work in parallel.
* Co-ordinate with your team to ensure prerequisite features are completed first (e.g. Giuliana completes `adminAuthRegister` on Monday meaning Yuchao can start `adminQuizCreate` on Tuesday).
* You can pull any other remote branch into your own using the command `git pull origin <branch_name>`.
    * This can be helpful when two people are working on functions on separate branches where one function is a prerequisite of the other, and an implementation is required to keep tests from failing.
* You should pull from `master` on a regular basis to ensure your code remains up-to-date.

### 🐶 3.8. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>35%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
    </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      Develop tests that show a clear demonstration of:
      <ul>
        <li>Good test <b>coverage</b> - covering the use cases extensively (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code. This includes logical commenting and good variable naming.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples (black-box testing), with little repetition.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>15%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
        <li>Appropriate and consistent style as covered so far in introductory programming and course content.</li>
        <li>Appropriate layout of files and use of modularity to reduce repetition and improve readability.</li>
        <li>Through comments/naming it is clear what the code is doing via human reading. Error messages aren't marked for quality.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>35%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>Your git commit messages are meaningful, clear, and informative.</li>
        <li>Branch names followed a consistent structure</li>
        <li>You contribute at least 2 meaningful merge requests (approved by another team member) that merge your branch code to master. Merge requests must have clear titles and descriptions, and include links to related issues/tasks.</li>
        <li>Merge requests were approved by another team member, and merged by you.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check-ins every week.</li>
        <li>Effective and regular use of course-provided MS Teams for communication (no other communication app should be used), demonstrating an ability to competently manage teamwork online.</li>
        <li>Attendance and contributions at your teams meetings and standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
        <li>Individual reflection is completed (assessed during project demo)</li>
        <li>Effective use of Gitlab issue board for task tracking. Individual tasks are assigned to group members and in the correct final state at the conclusion of the iteration. Task summary and description is logical, and the iteration's requirements are accurately represented.</li>
        <li>For particular features, issue acceptance criteria and some tests have been written prior to your implementation.</li>
      </ul>
      As a group, in terms of project management and teamwork:
      <ul>
        <li>Group contract is followed or revised to reflect the team's evolving work patterns.</l1>
        <li>Iteration reflection is completed, with actionable steps to improve in following iterations</li>
      </ul>
     </td>
    <tr>
  </tr>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 6 below.

The formula used for automarking in this iteration is:

`Mark = t * i` (Mark equals `t` multiplied by `i`).

Where:
 * `t` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).

### 🐶 3.9. Dryrun

We have provided a very simple dryrun for iteration 1 consisting of a few tests, including your implementation of `adminAuthRegister`, `adminAuthLogin`, `adminQuizCreate`. These only check the format of your return types and simple expected behaviour, so do not rely on these as an indicator of the correctness of your implementation or tests.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 1
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter1.test.cjs
```

Tips to ensure dryrun runs successfully:
* Files sit within the `/src` directory.

### 🐶 3.10. Submission & Teamwork Evaluation

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **teamwork evaluation**.


## 🐝 4. Iteration 2: Building a Web Server


### 🐝 4.1. Task

In this iteration, we will add more features to our project, and the focus has been changed to HTTP endpoints. Most of the theory surrounding iteration 2 is covered in week 4-5 lectures.

Iteration 2 both reuses a lot of work from iteration 1, as well as has new work.

In this iteration, you are expected to:

1. Make adjustments to your existing code as per any feedback given by your tutor for iteration 1.
2. Migrate your Javascript files to Typescript.
3. Implement and test the HTTP Express server according to the [interface provided in the specification](swagger.yaml).

    * Your implementation should build upon your work in iteration 1, and ideally your HTTP layer is just a wrapper for underlying functions you've written that handle the logic, see week 4&5 content.

    * Introduce user sessions for your login system (see 4.9).

    * You can structure your tests inside a `/tests` folder, as long as they are appended with `.test.ts`. For this iteration and iteration 3 we will only be testing your HTTP layer of tests. You may still wish to use your iteration 1 tests and simply wrap up them - that is a design choice up to you. An example of an HTTP test can be found in section 4.4.

    * At least one new iteration 2 route per group member must be completed.

    * You should not change the provided tsconfig.json file, as this configuration is also used by the automarker.

4. Ensure your code is linted to the provided style guide.

    * `eslint` should be added to your repo via `npm` and then added to your `package.json` file to run when the command `npm run lint` is run. The provided `.eslintrc.json` file and files scanned by `npm run lint` is *very* lenient, so there is no reason you should have to disable any additional checks. This is the exact configuration used by the automarking, so you should not change it.

    * You need to edit the `gitlab-ci.yml` file, as per section 4.6 to add linting to the code on `master`. **You must do this BEFORE merging anything from iteration 2 into `master`**, so that you ensure `master` is always stable. See section 4.6 below for instructions on adding linting to your pipeline.

5. Continue demonstrating effective project management and effective git usage.

    * This includes thoughtful project management and use of git effectively, including working effectively with your team.

    * All task tracking and management will need to be done via the GitLab Issue Board (see section 7.8).

    * Regular group meetings must be documented with meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo wiki after each meeting). These minutes should **at least** contain the time and date, attendance, any discussion topics and their resolutions, as well as the assigning/reassigning of any tasks if discussed. 

    * You need to demonstrate evidence of regular standup messages (at least 2 per week).

    * You need to regularly and thoughtfully make merge requests for the smallest reasonable units, and merge them into `master`. 

    * You need to thoughtfully review your teammate's merge requests. A code review gives you the power to help improve and catch out any bugs in other peoples code code early.

    * Complete individual reflection alongside an end-of-iteration group reflection.

6.  Remove any type errors in your code

    * Run `npm run tsc` and incrementally fix all type errors.

    * Either choose to change one file at a time, or change all file extensions and use `// @ts-nocheck` at the beginning of select files to disable checking on that specific file, omitting errors.

    * You will receive automarks for typescript compliance in iteration 3. We recommend you begin in iteration 2 since groups who ensure their code are type-safe tend to perform much better in the automarker.

    * You need to edit the `gitlab-ci.yml` file, as per section 4.6 to add typechecking to the code on `master`.

**As part of this iteration it is required that your backend code can correctly power the frontend**. Note that an incomplete backend will mean the frontend cannot work. You should conduct acceptance tests (run your backend, run the frontend and check that it works) prior to submission.

In this iteration we also expect for you to improve on any feedback left by tutors in iteration 1.

### 🐝 4.2. Running the server

To run the server you can use the following command from the root directory of your project:

```bash
npm start
```

This will start the server on the port in the src/server.ts file, using `tsx`.

If you get an error stating that the address is already in use, you can change the port number in `config.json` to any number from `49152` to `65535`. It is likely that another student is using your original port number.

Do **NOT** move the location of either `config.json` or `server.ts`. You must utilise the host/port combination from the `config.json` for the server, and any auxilliary calls to routes within your test files. You may edit the port/host field within the `config.json` file, but be sure to dynamically import the port from this file for all your tests and do **NOT** hard-code its value since this may result in automarking failures.

You can also start your server in "dev mode", meaning it will automatically restart when any project files are modified.

```bash
npm run dev
```

### 🐝 4.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
2. Write function stub/s for your feature.
3. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
4. Implement that feature.
5. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
6. Create a merge request for the branch.
7. Get someone in your team who **did not** work on the feature to review the merge request.
8. Fix any issues identified in the review.
9. After merge request is **approved** by a different team member, merge the merge request into `master`.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.ts`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature be implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* You should have black-box tests for all tests required (i.e. testing each function/endpoint).
* Merging requests with failing pipelines can lead to issues and should be avoided to maintain code quality and stability. Not only does this interfere with your teams ability to work on different features at the same time, and thus slow down development, it is something you will be penalised for in marking.
* Similarly, you need to only merge in branches with tested features.
* Direct pushes to `master` are restricted in this repository. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.
* We encourage you to **write some tests before writing the implementation**. This practice helps ensure your implementation is comprehensively thought out, and will assist you in future iterations.

### 🐝 4.4. Testing the interface

In this iteration, **the layer of abstraction has changed to the HTTP level**, meaning that you are only required to write integration tests that check the HTTP endpoints, rather than the style of tests you wrote in iteration 1 where the behaviour of the Javascript functions themselves was tested.

You will need to check as appropriate for each success/error condition:
* The return value of the endpoint;
* The behaviour (side effects) of the endpoint; and
* The status code of the response.
* The `error` field in the response error object (if applicable). 

#### 🐝 4.4.1 Black Box Testing with Error Objects

To recall from way back in section 3.4.2:

> Black box means (tests) should not depend on your specific implementation, but rather work with *any* faithful implementation of the project interface specification. I.e. you should design your tests such that if they were run against another group's backend they would still pass.

As the interface only specifies strict values for the `error` field and NOT the `message` field, a black box test should only check for these specific error types and NOT check for specific `message` strings. 
This allows the freedom for *any faithful implementor* of the interface to be descriptive with their error `message` fields, whilst letting a consumer of the API rely on the static and strictly defined `error` type field. 

An example of how you would now test the echo interface is in `newecho.test.ts`.

### 🐝 4.5. Testing time-based properties

Some routes will have timestamps as properties. The tricky thing about timestamps is that the client makes a request at a known time, but there is a delay between when the client sends the request and when the server processes it. E.G. You might send an HTTP request to create a quiz, but the server takes 0.3 seconds until it actually creates the object, which means that the timestamp is 0.3 seconds out of sync with what you'd expect.

To solve this, when checking if timestamps are what you would expect, just check that they are within a 1 second range.

E.G. If I create a quiz at 12:22:21pm I will then check in my tests if the timestamp is somewhere between 12:22:21pm and 12:22:22pm.

### 🐝 4.6. Continuous Integration

You will need to manually edit the `gitlab-ci.yml` file to lint and typecheck code within the pipeline. This will require the following:
 * Addition of `npm run lint` as a script under a custom `linting` variable, a part of `stage: checks`.
 * Addition of `npm run tsc` as a script under a custom `typechecking` variable, as part of `stage: checks`.
 * You must ensure these checks are run on every new merge request for this iteration.

Refer to the lecture slides on continuous integration to find exactly how you should add these.

### 🐝 4.7. Versioning

You might notice that some routes are prefixed with `v1`. Why is this? When you make changes to specifications, it's usually good practice to give the new function/capability/route a different unique name. This way, if people are using older versions of the specification they can't accidentally call the updated function/route with the wrong data input. If we make changes to these routes in iteration 3, we will increment the version to `v2`.

Hint: Yes, your `v1` routes can use the functions you had in iteration 1, regardless of whether you rename the functions or not. The layer of abstraction in iteration 2 has changed from the function interface to the HTTP interface, and therefore your 'functions' from iteration 1 are essentially now just implementation details, and therefore are completely modifiable by you.

### 🐝 4.8. User Sessions

#### The problem with Iteration 1 `userId`

In iteration 1, a problem we have with the `userId` is that there is no way to "log-out" a user - because all the user needs to identify themselves is just their user ID.

In iteration 2, we want to issue something that abstracts their user ID into the idea of a session - this way a single user can log in, log out, or maybe log in from multiple places at the same time.

If you're not following the issue with the `userId`, imagine it like trying to board a plane flight but your boarding pass IS your passport. Your passport is (effectively) a permanent thing - it is just "always you". That wouldn't allow staff to check if you should or shouldn't be on that plane, which is why airlines issue out boarding passes - to essentially grant you a "session" on a plane. And your boarding pass is linked to your passport. In this same way, a session is associated with an `userId`!

#### How we adapt in Iteration 2 - User Sessions

In iteration 2, instead of passing in `userId` into functions, we will instead pass in a session. Then on our server we look up the session information (which we've stored) to:
* Identify if the session is valid.
* Identify which user this session belongs to.

Then in this way, we can now allow for things like the ability to meaningfully log someone out, as well as to have multiple sessions at the same time for multiple users (e.g. imagine being logged in on two computers but only wanting to log one out).

How you generate unique identifiers for sessions is up to you.

#### Avoiding sessions being exposed in the URL

In this iteration, you will utilize a `session` HTTP header when dealing with requests/routes only. You shouldn't remove `userId` parameters from backend functions, as they must perform the validity checks.

You can access HTTP headers like so:
```javascript
const session = req.header('session');
```

#### In summary

Implementation details are up to you, though the key things to ensure that you comply with are that:
* Session values must be passed via HTTP headers.
* Your system allows multiple sessions to be able to be logged in and logged out at the same time.

### 🐝 4.9. Error returning

Either a `400 (Bad Request)` or `401 (Unauthorised)` or `403 (Forbidden)` is returned when something goes wrong. A `400` error refers to issues with user input; a `401` error refers to when someone does not attempt to authenticate properly, and a `403` error refers to issues with authorisation. Most of the routes in the API interface provided throw types of these errors under various conditions.

To return one of these errors, simply use the code `res.status(400).send(JSON.stringify({ error: 'ERROR_TYPE', message: 'Descriptive error message here' }))` or `res.status(400).json({ error: 'ERROR_TYPE', message: 'Descriptive error message here' })` in your server where 400 is the error.

Errors are returned in the following order: 401, then 403, then 400. How you determine which status code to return is up to you, but remember the principles of modularity and maintainability.

### 🐝 4.10. Using the Provided Frontend to Support Your Backend Development

Your main task in this assignment is to build a backend. To help you test and understand how your backend functions in a real-world scenario, we are providing a frontend that interacts with it.


There is a SINGLE repository available for all students at
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/25T3/project-frontend>.
You can clone this frontend locally. Please remember to pull regularly as we continue to work on the frontend. If you run the frontend at the same time as your express server is running on the backend, then you can power the frontend via your backend.

However, this frontend is not perfect—it's a tool to assist you, not a flawless product. It may have limitations and won't cover every possible edge case. That said, it should still be useful for:
* Visualizing how your backend responds to real interactions
* Testing and debugging your backend in a practical way

Please note: The frontend may have very slight inconsistencies with expected behaviour outlined in the specification. Our automarkers will be running against your compliance to the specification.


#### 🐝 4.10.1. Example implementation

A working example of the Toohak application can be used at <https://project-frontend-cs1531.vercel.app/>. This is not a strict reference implementation that dictates exact behavior in all scenarios. Just as you will need to make reasonable assumptions in your own implementation, we have made ours—some of which may differ from yours, and that's completely fine. However, if you encounter ambiguities in the specification, you can use this implementation as a guide to help clarify expected behavior, or check with us on the forum. 

The data is reset occasionally, but you can use this link to play around and get a feel for how the application should behave.

Please note: This example application is experimental. It will not be perfect and is always under development.

### 🐝 4.11. Recommended approach

Our recommendation with this iteration is that you start out trying to implement the new functions similarly to how you did in iteration 1.

1. Write HTTP tests. These will fail as you have not yet implemented the feature.
  * ‼️‼️ HINT: To improve the marks you get and speed at which you get work done, consider trying to avoid re-writing your tests for iteration 2 and instead tweak your iteration 1 tests that they can be "used" by the HTTP server.
2. Implement the feature and write the Express route/endpoint for that feature too.
  * ‼️‼️ HINT: make sure GET and DELETE requests utilise query parameters, whereas POST and PUT requests utilise JSONified bodies.
3. Run the tests and continue following 4.3. as necessary.

**Please note, when you have a single route (e.g. `/my/route/name`) alongside a wildcard route (e.g. `/my/route/{variable}`) you need to define the single route before the variable route.**

### 🐝 4.12. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>40%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
      <li>Correctly written tests based on the specification requirements.</li>
      <li>Correctly linted code.</li>
    </ul>
    Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      <ul>
        <li>Good test <b>coverage</b> - covering the use cases extensively (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code. This includes logical commenting and good variable naming.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples (black-box testing), with little repetition.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.).</li>
        <li>Appropriate style and documentation as described in section 7.4. and all lecture material</li>
        <li>Appropriate layout of files and use of modularity to reduce repetition and improve readability.</li>
        <li>Through comments/naming it is clear what the code is doing via human reading. Error messages aren't marked for quality.</li>
        <li>Appropriate application of good software design practices.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>25%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>Your git commit messages are meaningful, clear, and informative.</li>
        <li>You contribute at least 2 meaningful merge requests (approved by another team member) that merge your branch code to master. Merge requests must have clear titles and descriptions, and include links to related issues/tasks.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check-ins every week.</li>
        <li>Effective and regular use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
        <li>Effective use of Gitlab issue board for task tracking. Individual tasks are assigned to group members and in the correct final state at the conclusion of the iteration. Task summary and description is logical, and the iteration's requirements are accurately represented.</li>
        <li>For particular features, issue acceptance criteria have been written prior to your implementation.</li>
        <li>Attendance and contributions at your teams meetings and standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
        <li>Individual reflection is completed (assessed during project demo)</li>
      </ul>
      As a group, in terms of project management and teamwork:
      <ul>
        <li>Group contract is followed or revised to reflect the team's evolving work patterns.</l1>
        <li>Iteration reflection is completed, with actionable steps to improve in following iterations</li>
      </ul>
     </td>
  </tr>
  <tr>
    <td>Feature Demonstration</td>
    <td>10%</td>
    <td><ul>
      <li>Demonstrated successful connection of the supplied frontend to the backend code.</li>
    </ul>
    </ul>
    </td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 7 below.

The formula used for automarking in this iteration is:

`Automark = 95*(t * i) + 5*e`
(Mark equals 95% of `t` multiplied by `i` plus 5% of `e`). This formula produces a value between 0 and 1.

Where:
 * `t` is the mark between 0-1 you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark between 0-1 you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).
 * `e` is the score between 0-1 achieved by running eslint against your code with the provided configuration. You may find a mark of 0 if you have used eslint disable comments in your code.


### 🐝 4.13. Dryrun

The dryrun checks the format of your return types and simple expected behaviour for a few basic routes. Do not rely on these as an indicator for the correctness of your implementation or tests.

To run the dryrun, you should be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 2
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter2.test.js
```

### 🐝 4.14. Submission & teamwork evaluation

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **teamwork evaluation**.

## 🦆 5. Iteration 3: Completing the Lifecycle

Iteration 3 builds off all of the work you've completed in iteration 1 and 2. You need to complete iteration 2 as part of this iteration, if you haven't completed them. Most of the work from iteration 1 and 2 can be recycled, but the following consideration(s) need to be made:
* `DELETE /v2/admin/quiz/{quizId}/question/{questionId}` has a new error condition.
* `DELETE /v2/admin/quiz/{quizid}` has a new error condition.

Iteration 2 routes and Iteration 3 routes do not need to be interoperable. You can assume that for a given usage of your system, once someone is using iteration 3 routes they can be assumed to not be calling any iteration 2 routes. In this way we need iteration 2 routes to still function properly, but in a way that is fine to be isolated from iteration 3 routes.

### 🦆 5.1. Task

In this iteration, you are expected to:

1. Make adjustments to your existing code and tests as per any feedback given by your tutor for iteration 2. In particular, you should take time to ensure that your code is well-styled and complies with good software writing practices and software and test design principles discussed in lectures. This includes focusing on:

    1. Applying designing for maintainability concepts were taught in lectures
    2. Using exceptions to "throw errors" instead of returning errors in the functions you call from `server.ts`.
    3. Ensuring abstraction between the HTTP layer and the application logic layer, i.e. there are no references to express.js variables such as `req`, `res`, status codes, or other server-specific logic in implementation functions outside of `server.ts`. You may utilise these within helper/utility files designed to simplify server logic.

2. Implement and test the HTTP Express server according to the [entire interface provided in the specification](swagger.yaml), including all new routes added in iteration 3.

    * Part of this section will be automarked.

    * It is required that your data is persistent.

    * `eslint` is assessed identically to iteration 2, with the addition of no explicit `any` type usage.

    * Good coverage for all files that aren't tests will be assessed: see section 5.4 for details.

    * You should structure your test files inside a `/tests`, folder and append them with `.test.ts`. For this iteration, we will only be testing your HTTP layer of tests.

    * In iteration 2 and 3, we provide a frontend that can be powered by your backend: see section 4.11 for details. Note that the frontend will not work correctly with an incomplete backend. As part of this iteration, it is required that your backend code can correctly power the frontend.

    * You must comply with instructions laid out in `5.3`

    * Ensure that you correctly manage user sessions and passwords in terms of authentication and authorisation, as per requirements laid out in section `5.8`.

3. Continue demonstrating effective project management and git usage.

    * You will be marked on your thoughtful approach to project management and effective use of git. The degree to which your team works effectively will also be assessed.

    * As for iteration 1 and 2, all task tracking and management will need to be done via the GitLab Issue Board (see section 7.8).

    * As for iteration 1 and 2, regular group meetings must be documented with meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo wiki after each meeting). These minutes should **at least** contain the time and date, attendance, any discussion topics and their resolutions, as well as the assigning/reassigning of any tasks if discussed. 

    * As for iteration 1 and 2, you must be able to demonstrate evidence of regular standups (at least 2 per week).

    * You are required to regularly and thoughtfully make merge requests for the smallest reasonable units, and merge them into `master`.

    * You need to thoughtfully review your teammate's merge requests. A code review gives you the power to help improve and catch out any bugs in other peoples code code early.

4. Optionally implement open-ended bonus features that extend Toohak's functionality through external APIs (e.g., trivia databases, weather data, GIFs) or advanced file/multi-user capabilities (e.g., collaborative quizzes, CSV exports, quiz import/export) for up to 10% bonus marks.

### 🦆 5.2. Running the server

To run the server, you can run the following command from the root directory of your project (e.g. `/project-backend`):

```bash
npm start
```

This will start the server on the port in the `src/server.ts` file, using `tsx`.

If you get an error stating that the address is already in use, you can change the port number in `config.json` to any number from 1024 to 49151. Is it likely that another student may be using your original port number.

Please note: For routes involving the playing of a game and waiting for questions to end, you are not required to account for situations where the server process crashes or restarts while waiting. If the server ever restarts while these active "quiz games" are ongoing, you can assume they are no longer happening after restart.

You can also start your server in "dev mode", meaning it will automatically restart when any project files are modified.

```bash
npm run dev
```

### 🦆 5.3. Implementing and testing features

Continue working on this project by making distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
2. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
3. Implement that feature.
4. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
5. Create a merge request for the branch.
6. Get someone in your team who **did not** work on the feature to review the merge request. When reviewing, **not only should you ensure the new feature has tests that pass, but you should also check that the coverage percentage has not been significantly reduced.**
7. Fix any issues identified in the review.
8. Merge the merge request into master.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.ts`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature be implemented by only one person. In fact, we encourage you to work together closely on features.

* You should have black-box integration tests for all tests required (i.e. testing each function/endpoint).
* Merging in merge requests with failing pipelines is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development - it is something you will be penalised for in marking.
* Similarly, merging in branches with untested features is also **very bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* We encourage you to **write some tests before writing the implementation**. This practice helps ensure your implementation is comprehensively thought out, and will assist with coverage scoring.

### 🦆 5.4. Test coverage

To get the coverage of your tests locally, you will need to have two terminals open. Run these commands from the root directory of your project (e.g. `/project-backend`).

In the first terminal, run
```bash
npm run start-coverage
```

In the second terminal, run jest as usual
```bash
npm run test
```

Back in the first terminal, stop the server with Ctrl+C or Command+C. There should now be a `/coverage` directory available. Open the `index.html` file in your web browser to see its output.

### 🦆 5.5. States & Actions

Iteration 3 sees the introduction of a quiz game, which describes a particular instance of a quiz being run.

Quiz games can be in one of many states:
 * **LOBBY**: Players can join in this state, and nothing has started.
 * **QUESTION_COUNTDOWN**: This is the question countdown period. It always exists before a question is open.
 * **QUESTION_OPEN**: This is when players can see the question, and the answers, and submit their answers (as many times as they like).
 * **QUESTION_CLOSE**: This is when players can still see the question, and the answers, but can no longer submit answers.
 * **ANSWER_SHOW**: This is when players can see the correct answer, as well as everyone playings' performance in that question, whilst they typically wait to go to the next countdown.
 * **FINAL_RESULTS**: This is where the final results are displayed for all players and questions.
 * **END**: The game is now over and inactive.

There are 5 key actions that an admin can send that moves us between these states:
 * **NEXT_QUESTION**: Move onto the countdown for the next question.
 * **SKIP_COUNTDOWN**: This is how to skip the question countdown period immediately.
 * **GO_TO_ANSWER**: Go straight to the next most immediate answers show state.
 * **GO_TO_FINAL_RESULTS**: Go straight to the final results state.
 * **END**: Go straight to the END state.

The constraints on moving between these states can be found in the state diagram here: <https://miro.com/app/board/uXjVMNVSA6o=/?share_link_id=275801581370>.

If a constraint isn't specified in the spec or in the diagram above, it can be considered as undefined behaviour where you can make your own assumptions. 

#### 🦆 5.5.1. A note on timers

In order to implement the gameplay system, you will likely need to make use of JavaScript's timer system. This code can be very challenging to debug, and may cause your server to crash entierly if you don't handle errors correctly. As such, you may find it useful to use a library that can help you diagnose and debug timer-related issues, rather than using functions like `setTimeout` and `clearTimeout` directly. We recommend you consider the [downtimer](https://www.npmjs.com/package/downtimer) library, which offers useful logging and debugging features.

### 🦆 5.6. Error raising & Separation of Concerns

It's important that as part of separating the concerns of the HTTP server and the application logic that your server never passes in an express.js request or response object to any subsequent functions that handle application logic. Similarly, those functions should not return status codes. **The application shouldn't be aware of the fact that is being used by an HTTP server.**

In iteration 3, we require you to use *exceptions* to handle errors being returned up to your `server.ts` file. Your `server.ts` will still be using `res.status(400)`, `res.status(401)`, or `res.status(403)`. **You do not need to do this in your tests.**

Another way to explain this is that all of the functions that your `server.ts` calls should only "return" a value if successful, or throw an exception if unsuccessful.

**How you use exceptions is up to you** - this is a refactor, so tutors will manually mark this as the API behaviour will remain unchanged. \
We have included a [custom ToohakError class](src/toohakError.ts) for you to use, very similar to the one found in Tutorial 7. **It is completely optional** to use this. It is still possible to get full marks with just the base `Error` and a clean and consistent solution.

A sample before and after snippet of code is used below to explain.

**before**

```javascript
function otherFunction(id) {
  if (id === 0) {
    return {
      error: 'INVALID_INPUT',
      message: 'Cannot be 0',
    };
  }

  return {
    result: id * 2
  };
};

app.get((req, res) => {
  const value = otherFunction(req.query.id);
  if (value.error) {
    res.status(400);
  }

  res.json(value);
});
```

**after**

```javascript
function otherFunction(id) {
  if (id === 0) {
    // NOTE: You will need to figure out a way to include the error type here. 
    throw new Error('Cannot be 0');
  }

  return {
    result: id * 2
  };
};

app.get((req, res) => {
  try {
    const value = otherFunction(req.query.id);
    res.json(value);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
```

We recommend that you refactor **gradually** and not in one giant merge request.

### 🦆 5.7. Storing data
You are required to store data persistently in this iteration.

Modify your backend such that it is able to persist and reload its data store if the process is stopped and started again. The persistence should happen at regular intervals so that in the event of unexpected program termination (e.g. sudden power outage) a minimal amount of data is lost. You may implement this using whatever method of serialisation you prefer (e.g. JSON).

### 🦆 5.8. Safer User Games and Secure Passwords

#### 🦆 5.8.1. Secure Passwords

For iteration 3, we require that passwords must be stored in a **hashed** form. It is up to you to decide on the best approach for this. 

##### Background

Hashes are one-way encryption where you can convert raw text (e.g. a password like `password123`) to a hash (e.g. a sha256 hash `ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f`).

If we store passwords as the hash of the plain text password, as opposed to the plain text password itself, it means that if our data store is compromised that attackers would not know the plain text passwords of our users.

We do not require you to use a hashing algorithm that is not brute forcable. If you are interested in current industry standards for password hashing see <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>.


#### 🦆 5.8.2. More random user session IDs

We require that you obfuscate your user sessions to prevent enumeration. You can do this one of two ways:
 1. Using a randomly generated session ID (rather than incremental session IDs, such as 3492, 485845, 49030); or
 2. Returning a hash of a sequentially generated session ID (e.g. session IDs are 1, 2, 3, 4, but then you return the hash of it)

You may already be doing (1) depending on your implementation from the previous iteration.

#### 🦆 5.8.3. Summary

The following describes one potential way of implementing:

A sample flow logging a user in might be as follows (other flows exist too):
1. Client makes a valid `auth/register` call.
2. Server stores the hash of the plain text password that was provided over the request, but does not store the plain text password.
3. Server generates an incremental session ID (e.g. 1, 2, 3) and then stores a hash of that session ID to create something obfuscated.
4. Server returns that hash of the session ID to the user in the response body.


### 🦆 5.9. Scoring & Ranking

To determine the score a user receives for a particular question:
 * If they do not get the question correct or do not answer the question, they receive a score of 0.
 * If they do get the question correct, the score they received is P\*S where P is the points for the question, and S is the scaling factor of the question.
   * The scaling factor of the question is 1/N, where N is the number of how quickly they correctly answered the question. N = 1 is first person who answered correctly, N = 2 is second person who answered correctly, N = 3 is third person who answered correctly, etc.
   * Players who answer the question at the exact same time results in undefined behaviour.
 * For multiple-correct-answer questions, people need to select all the correct answers (no less, no more) to be considered having gotten the question correct.

When returned through any of the inputs:
 * All scores for a particular question are rounded to the nearest integer.
 * If there are players with the same final score, they share the same rank, e.g. players scoring 5, 3, 3, 2, 2, 1 have ranks 1, 2, 2, 4, 4, 6.

### 🦆 5.10. Open-ended Feature(s)
Bonus marks are available to students who have completed the rest of the project. The time investment to earn these marks is significantly higher than other components of this iteration. 

You may select and work on these features independently, or with your team members. If you chose to work with others you must ensure equal contribution, and if you chose to work independently, you must communicate with your team members to ensure your work does not overlap.

You must document your open-ended features within your iteration 3 reflection and in `open.md`. Bonus marks (up to 10%) will be added to your final project grade. 

Your tutor is not required to provide any assistance with the bonus features section, as it's intended for high-achieving students.

#### Part A: Thinking Bigger with APIs

In this iteration, you will design a new route (or set of routes) which utilizes a publicly available API to extend on the existing Toohak features. 

Examples you may choose to design and implement:
* Trivia question API: Add trivia questions dynamically from a public trivia database: <https://opentdb.com/api_config.php>
* Weather: Display real-time weather info on the quiz lobby screen based on host location: <https://open-meteo.com/en/docs>
* Geolocations: Create a leaderboard that shows participants' countries using IP geolocation <https://ipinfo.io/developers>
* GIFs: Use a GIF search feature to let users react to quiz answers <https://tenor.com/gifapi/documentation>
* Quotes: Implement a motivational quote pop-up between rounds <https://docs.zenquotes.io/zenquotes-documentation/>

It is your responsibility to be aware of any rate-limits of your chosen API, along with its reliability.

#### Part B: Thinking Bigger with Files or Multi-user elements 

You've been taught the basics of persistance via file storage, and multi-user interaction via sessions. In this section, you should design a route (or set of routes) which deal with either files or feature interactive/multi-user elements.

Examples you may choose to design and implement:
* Collaborative Quizzes: Enable collaborative quizzes where multiple users can work together to answer questions.
* Quiz Question Randomizer: Import a set of quiz questions and randomly sample questions each time the quiz runs.
* CSV Results: users can generate a file (e.g., CSV, JSON) of a quiz's final results for a quiz admin to download.
* Quiz Import/Export: Allow users to import and export quizzes in various formats (e.g., CSV, JSON) for easy sharing and backup.
* File Attachments: Allow users to attach files (e.g., images, PDFs) to quiz questions for more comprehensive content.

Please note: implementing one of the above suggestions does not guarantee full bonus marks for this section. You should think deeply about the full SDLC when coming up with these features, asking yourself why the feature should exist, its usecases, how the interface can be practical, and how it could be expanded upon in future. 

As a rough guide, if you would like high marks in this section you should expect to spend at least 20 hours on your open-ended feature. Hence, if you're aiming for full marks you will likely need to implement **both part A and B**. See the marking criteria for further guidance.

#### How to deliver your feature(s)
Add your route design to the existing `swagger.yaml` file, with the route name, description, error cases, and expected request and response objects.

You should write black-box tests, add the route to your `server.ts` file, and implement logic within your `src` directory, as with other routes.

Complete the template within `open.md`  and merge this to Master. **Tutors will not look for bonus features that are not at least documented in the master `open.md`.**

#### Presenting your feature(s)
As part of the bonus features section of this iteration, you are required to film a 2 minute video demonstrating what you have created.

In this video, you should:
* Explain what you have implemented and how it works
* Include a demonstration of it working/running successfully with an API platform (e.g. Postman, Insomnia).

We recommend submitting a screen-recording - it's a bonus if your face is in it! You may use any software to record this, for example <a href="https://www.canva.com/en_au/help/talking-presentations/">Canva's Present and record mode</a>, <a href="https://www.loom.com/screen-recorder">Loom</a>, or another tool of your choice to do this.

Upload your video to SharePoint from your UNSW account, ensure the sharing settings are "Anyone with the link", and provide the video URL and additional details within the `open.md` file in your project repo. 

**It is your responsibility to ensure the correct sharing access on your video at the time of submission** - tutors will not reach out to request access, and you will NOT receive bonus marks.

### 🦆 5.11. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>45%</td>
    <td>
    <ul>
      <li>Correct implementation of specified routes.</li>
      <li>Correctly written tests based on the specification requirements.</li>
      <li>Code coverage.</li>
      <li>Correctly linted code.</li>
      <li>Correctly type-checked code.</li>
    </ul>
     Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
     Note: <b>Up to 10% of the automarking will be done on iteration 2 routes that we still expect to be functional / backwards compatible.</b>
  </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>20%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.).</li>
        <li>Appropriate style and documentation as described in section 7.4. and all lecture material</li>
        <li>Appropriate layout of files and use of modularity to reduce repetition and improve readability.</li>
        <li>Through comments/naming it is clear what the code is doing via human reading. Error messages aren't marked for quality.</li>
        <li>Appropriate application of good software design practices.</li>
        <li>Implementation of persistent state.</li>
        <li>Appropriate separation of server and implementation logic, as per section 5.1.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>25%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>Your git commit messages are meaningful, clear, and informative.</li>
        <li>You contribute at least 2 meaningful merge requests (approved by another team member) that merge your branch code to master. Merge requests must have clear titles and descriptions, and include links to related issues/tasks.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check-ins every week.</li>
        <li>Effective and regular use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
        <li>Effective use of Gitlab issue board for task tracking. Individual tasks are assigned to group members and in the correct final state at the conclusion of the iteration. Task summary and description is logical, and the iteration's requirements are accurately represented.</li>
        <li>For particular features, issue acceptance criteria and some tests have been written prior to your implementation.</li>
        <li>Attendance and contributions at your teams meetings and standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
        <li>Individual reflection is completed (assessed during project demo)</li>
      </ul>
      As a group, in terms of project management and teamwork:
      <ul>
        <li>Group contract is followed or revised to reflect the team's evolving work patterns.</l1>
        <li>Iteration reflection is completed, with actionable steps to improve in future projects</li>
     </td>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Features</td>
    <td>10%</td>
    <td><ul>
      <li>Demonstrated successful connection of the supplied frontend to the backend code.</li>
      <li>Correct implementation of section 5.8. Safer User Games and Secure Passwords</li>
    </ul>
  </td>
  </tr>
    <td>Open-ended features</td>
    <td>10% bonus mark</td>
    <td>
    <ul>
      <li>Correctness and Integration: Working demonstration of a complete feature(s) that includes persistence, multi-user support, and external APIs. The feature integrates well with Toohak's existing requirements, does not regress any existing features, and meaningfully extends the current project state.</li>
      <li>Technical Depth: The feature presents a non-trivial technical challenge and demonstrates application of skills beyond the core course content. It required research, self-directed learning, and likely modifications to prior code to help deeply integrate with existing features/data.</li>
      <li>Creativity: The solution shows original thought, creativity, or personal insight. It might solve an uncommon problem, approach a common need in a novel way, or address a user scenario not previously covered.</li>
      <li>API Specification: API routes are clearly and modularly defined in swagger.json, with accurate reflection of purpose, implementation, and required query/body parameters. Correct HTTP methods and relevant error conditions are documented.</li>
    </ul>
    This component will be assessed individually, according to contribution details within `open.md`.
  </td>
  </tr>
</table>

The formula used for automarking in this iteration is:

`Mark = 90*(g * i^2 * min(c + 1, 100)^3) + 5*e + 5*t`
(Mark equals 90% of `g` multiplied by `i` squared multiplied by the lower of `c + 1` or `100`, to the power of three, plus 5% of `e`, plus 5% of `t`).

Where:
 * `g` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).
 * `c` is the statement coverage score achieved by running coverage on your entire codebase. A single mark is added to this to account for anything impossible to test in a blackbox manner, and is capped at 100. Please note in the formula above coverage is **heavily weighted**.
 * `e` is the score between 0-100 achieved by running <code>eslint</code> against your code and the provided configuration. You may find a mark of 0 if you have used eslint disable comments in your code.
 * `t` is the score between 0-10 achieved by running <code>tsc</code> against your code and the provided configuration.

 Please note coverage is heavily weighted in the formula above. Your overall automark is limited by your code coverage performance.

### 🦆 5.11. Dryrun

The dryrun checks the format of your return types and simple expected behaviour for a few basic routes. Do not rely on these as an indicator for the correctness of your implementation or tests.

To run the dryrun, you should be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 3
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter3.test.js
```

### 🦆 5.12. Submission & teamwork evaluation

Please see section 6 for information on **due date**. 

Please see section 7.5 for information on **teamwork evaluation**.


## 🌸 6. Due Dates and Weightings

| Iteration | Due date                             | Demonstration to tutor(s)     | Assessment weighting (%) |
| --------- | ------------------------------------ | ----------------------------- | ------------------------ |
| 0         | 6pm Friday 26th September (**week 2**)    | No demonstration              | 5% of project mark       |
| 1         | 6pm Friday 10th October (**week 4**)    | In YOUR **week 5** laboratory | 15% of project mark      |
| 2         | 6pm Friday 31st October (**week 7**)    | In YOUR **week 8** laboratory | 40% of project mark      |
| 3         | 6pm Monday 17th November (**week 10**)    | In YOUR **week 10** laboratory   | 40% of project mark      |

For more information about demonstrations see section `6.2`.

### 🌸 6.1. Submission & Late Penalties

To submit your work, simply have your master branch on the gitlab website contain your groups most recent copy of your code. I.E. "Pushing to master" is equivalent to submitting. When marking, we take the most recent submission on your master branch that is prior to the specified deadline for each iteration.

The following late penalties apply depending on the iteration:
 * Iteration 0: No late submissions at all.
 * Iteration 1: No late submissions at all.
 * Iteration 2: No late submissions at all.
 * Iteration 3: Can submit up to 48 hours late, with 5% penalty applied off your mark every time a 24 hour window passes, starting from the due date.

We will not mark commits pushed to master after the final submission time for a given iteration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some rare cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

## 🏃 6.2. Rerun Opportunity – Fix & Resubmit

We understand that after submitting your assignment, you may realize that small but critical mistakes affected your marks or caused your software to fail. In the real world, such mistakes can have significant consequences, but learning from them is valuable.

To balance learning and accountability, we offer a rerun opportunity for trivial fixes, allowing you to fix issues and resubmit your project for reassessment. (although you may not have this opportunity for real-work projects)

How It Works:
* After marks are released, eligible groups can identify and make trivial fix in their project.
* You must resubmit within 7 days after receiving your initial mark.
* Your resubmitted work will be reassessed with an updated mark. However, since identifying and fixing issues before submission is an important skill in software development, the final mark will take into account the importance of thorough testing and review. The need for a rerun suggests that testing practices should be improved.
* A penalty value between 10-30% will be applied to the rerun, depending on the trivial fix(es) made (see section below on what constitutes a trivial fix). We recommend you do not exceed 3 unique trivial fixes per rerun to ensure your rerun isn't rejected (penalty values >30% result in a rejected rerun). 

If the fixes you make lead to a higher automark after adjustment, we will update your mark accordingly. E.g. your initial automark is 20%; After rerunning, your raw automark improves to 86%; an adjustment factor of 30% is applied, resulting in a final automark of 60%; Your new automark is updated to 60%.

If the adjusted rerun mark turns out to be lower than your original score, your original mark will remain unchanged. E.g. imagine that your initial automark is 50%; After rerunning, your raw automark improves to 70%; Applying the adjustment factor of 30%, the final rerun mark would be 49%; Since this is lower than your original 50%, we will keep your initial mark.

### How to request a re-run

* Create a branch, e.g. `iter[X]-fix`, based off the submission commit.
* Make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks).
* Create a merge request for this branch into the iteration's submission branch (i.e. `iterX-submission`), and take note of merge request ID in the URL
  * It is the number at the end of the URL i.e. https://nw-syd-gitlab.cseunsw.tech/COMP1531/25T3/groups/H17B_BUDGIE/project-backend/-/merge_requests/67 = 67.
* Log onto the [Gitruns site](https://cgi.cse.unsw.edu.au/~gitrun/) and submit that merge request ID (e.g. 67) for rerun
* Once you submit it, it will take up to 24 hours for you to receive the results of the rerun.
  * The results will appear in status "reviewing", which means an admin still needs to review the adjustment factor.
  * **Please note: The results of the rerun is your RAW automark BEFORE ANY penalties have been applied.**
* Once your MR has been reviewed (this can take up to 72 hours), the status will change to "Complete" and the result will be updated to the mark after adjustment
* If the mark after adjustment is higher than your current mark, this will then be updated in the grade system, and take 48 hours to propagate to you.

Please note: The current limit on reruns is one every 24 hours. You can submit multiple re-runs before waiting for manual review or mark propagation, as long as they are 24 hours apart.

#### What constitutes a "trivial fix"?
* Fixing spelling/capitalisation/naming issues with values specified in spec documentation
* Swapping a variable type e.g. session from 'number' to 'string'
* Changing the return value type e.g. returning {} rather than null, to match spec documentation
* Changing route versions e.g. v1 to v2 to match spec documentation
* Fixing import values
* Fixing a regex/logical equality check e.g. num === 0 to num === 1
* Fixing constant variable values e.g. loginAttempts = 1 to loginAttempts = 0
* As a general rule, any change that is < 3 lines of code

### 🌸 6.3. Demonstration

The demonstrations in weeks 5, 8 and 10 will take place during your lab sessions. All team members **must** attend these lab sessions. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15 minute Q&A in front of your tutor and potentially some other students in your tutorial. For online classes, webcams and audio are required to be on during this Q&A (your phone is a good alternative if your laptop/desktop doesn't have a webcam).

During this session, at a minimum we will expect groups to:
 * (each student) give a quick one sentence explanation of what you contributed
 * (for iteration 2 and 3 only) complete a demonstration of your server working with the supplied frontend

The remaining time will be Q&A led by a tutor.

**Note:** If individuals fail to answer questions regarding code written by themselves during an iteration correctly, individual marks may be deducted.

## 👌 7. Individual Contribution

The marks given to you for each iteration are given to you individually. We do however use group marks (e.g. automarking) to infer this, and in many cases, you may receive the same mark as your group members, particularly in cases with well functioning groups. Your individual mark is determined by a combination of the factors below by your tutor, with your group mark as a reference point.Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Teamwork evaluation
 * Reflections

### 👌 7.1. Project check-in

During your lab class, you and your team will conduct a short standup in the presence of your tutor. 

Your tutor will conduct a standup where each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. 

This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups, or deviations from your group contract established throughout the project.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
| Iteration | Week/Check-in | Expected progress                                                                                                                                     |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Week 2**    | Twice-weekly standup meeting times organised, iteration 0 completed |
| 1         | **Week 3**    | Iteration 1 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 1         | **Week 4**    | Tasks assigned in week 3 are completed, more than 50% of tests & functions for iteration 1 completed.                                                                                  |
| 2         | **Week 5**    | Iteration 2 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 2         | **Week 6**    | **(Checked by your tutor in week 7)** Typescript conversion completed, Server routes for all iteration 1 functions complete in master                                            |
| 2         | **Week 7**    | 1x new iteration 2 route per person complete (HTTP tests and implementation in master)                                                                       |
| 3         | **Week 8**    | Iteration 3 specification has been discussed in a meeting, at least 1 task per person has been assigned, Exceptions added across the project                                  |
| 3         | **Week 9**    | 1x iteration 3 route per person complete (HTTP tests and implementation in master)        , Iteration 3 in a near-complete state                             |

### 👌 7.2. Tutorial contributions

From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials.
* Participate in tutorials by asking questions and offering answers.
* [online only] Have your web cam on for the duration of the tutorial and lab.

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 👌 7.3. Code contribution

All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

Please also note that **failure to commit (as an individual) at least once in each week of your iteration may result in up to a 20% mark penalty**. It's critical that you at least demonstrate you can make minor progress each week. If this were an individual assignment we would not enforce this, but given it is a group assignment it's important we encourage you to commit regularly.

### 👌 7.4. Documentation contribution

All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  *
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  *
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 👌 7.5. Teamwork Evaluation

<a href="https://cgi.cse.unsw.edu.au/~cs1531/25T3/project/teamwork-evaluation"><b>Teamwork Evaluation link</b></a>.

**Please note: Failure to complete teamwork evaluation for a particular iteration may result in a mark penalty of 10% for the iteration**

At the end of each iteration, there will be a teamwork evaluation survey where you will rate and leave comments about each team member's contribution to the project up until that point.

Your other team members will **not** be able to see how you rated them or what comments you left in either teamwork evaluation. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down (after review by your tutor).

The following criteria will be assessed by your team members:
* **Participation**: What was the level of participation in group work, attendance at meetings, making suggestions, taking responsibility for tasks, being in communication with the team?
* **Dependability**: How dependable was this team member in delivering assigned tasks, on time, with expected levels of quality?
* **Team Wellbeing**: How much did this team member contribute to the healthy functioning of the team by communicating with members, coordinating meetings, listening to concerns, facilitating discussion, offering suggestions?
* **Work contribution**: How much did this team member contribute to the development of the major project?

<table>
  <tr>
    <th>Iteration</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td>6pm Friday 10th October</td>
    <td>6pm Monday 13th October</td>
  </tr>
  <tr>
    <td>2</td>
    <td>6pm Friday 31st October</td>
    <td>6pm Monday 3rd November</td>
  </tr>
  <tr>
    <td>3</td>
    <td>6pm Monday 17th November</td>
    <td>6pm Thursday 20th November</td>
  </tr>
</table>


### 👌 7.6 Reflections
You are expected to complete both individual reflections and group reflections at the end of iteration 1, 2 and 3.

Individual and group reflections for an iteration must be completed before the lab following the iteration due date, as it may be referenced by your tutor during your project demo. These reflections will help you improve for future iterations, and be used as a mechanism to influence individual marking.

Failure to participate in an end-of-iteration group reflection or individual reflection may result in a decreased individual project score. 


### 👌 7.7. Managing Group Problems

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS Teams. Make sure you have:
1. Been clear about the issue you feel exists.
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved.
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

### 👌 7.8. Effective Gitlab Issue Board Usage

When working on Toohak, you should be using use the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) (or similar) for your task tracking and allocation. 

A task can be anything, ranging from implementing a feature, testing a feature, testing and implementing a feature, a bug fix, typescript file conversions, or even the act of updating the team contract. No matter what it is, it should be well defined, measurable, completable, and minimal in scope (an issue containing multiple features is not a good issue). 

How your group chooses to track these tasks on the issue board is up to you. But for this to be considered effective, it would likely satisfy the following:

  * An issue created per feature/task with a concise descriptive title. 
  * <a href="https://www.atlassian.com/work-management/project-management/acceptance-criteria">Acceptance Criteria</a> for each task has been written prior to completion of the implementation.
  * Each issue had some indication of its iteration, such as a label, milestone or title prefix. 
  * Each issue had a description containing any implementation details or subtasks required. 
  * Each issue was assigned to the group member tasked with completing it.
  * At least 4 stages of progression, each with corresponding labels and columns on the issue board. For example, the labels might be "Todo" (or "Open"), "In Progress", "In Review" and "Done" (or "Closed"). 
  * Each issue's stage of progress was kept up to date by the assignee throughout the iteration. 

Feel free to build upon these ideas too! In the real world people use issue boards even more extensively, sometimes deep diving all implementation steps and adding this in the description, keeping track of the steps and decisions they made in the comments, and adding further labels about the risk or priority of the task. 

### 👌 7.9. Branch Naming Conventions

Branch names can be a powerful way to convey meaning about the code within a branch. 
A consistent and concise branch naming convention helps other developers find out what features are in-development, prevents the creation of duplicate branches, and can even be used by automation tools to track issues. 

In this project, you must come up with a branch naming convention. 
The structure is up for your team to decide, but it should be concise, informative and consistently used. 

One example structure:
```plaintext
<iteration>-<branch-type>-<short-description>
```
Where:
- `iteration` is the project iteration of the feature; `i0` or `iter1`. 
- `branch-type` is a prefix to describe the type of changes, like a feature (`feat`), bug fix (`fix`), non-code change (`chore`), etc...
- `short-description` is a short 3-6 word description of the changes, separated by hyphens (`-`). 

Some other examples:
```plaintext
"iter0-feat-create-auth-login-stub": Adds the adminAuthLogin stub. 

"i2-fix-unicode-password-validation": Fixes a password validation bug that caused a crash when unicode members added. 

"docs-update-members-in-contract": Removes some members from the group contract.
```

## 💻 8. Automarking & Preview

### 💻 8.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 90 second timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 90 seconds to run, you don't have to worry about it potentially taking longer when we run automarking.

### 💻 8.2. Pre-submission Preview

In the days preceding iterations 1, 2, and 3's due date, we will be running your code against the actual automarkers (the same ones that determine your final mark) and publishing the results of every group on [Gitrun](https://cgi.cse.unsw.edu.au/~cs1531/NOW/content/project/runs). You will get to see the current mark (within a range) of your submission. You will not receive any elaboration on how that mark was determined - if your mark isn't what you expect, work with your group and/or tutor to debug your code and write more tests.

You should have the code you wish to be tested in your `master` branch by **10pm** the night before preview runs.

3x previews are released for iteration 1, 2 and 3. Each preview release will occur on or before 12pm every Monday, Wednesday and Friday on the week of iteration due dates except for iteration 3, which occur in the week before the due date (given it is due on a Monday). There are no previews for iteration 0.

This preview run gives you a chance to sanity check your automark (without knowing the details of what you did right and wrong), and is just a bit of fun.

Please note the preview mark represents the hidden coursetest/automark performance only - it does not include coverage, linting, group test performance etc.

## ❓ 9. FAQs
Please see <https://discourse01.cse.unsw.edu.au/25T3/COMP1531/t/useful-posts-faqs/32>.

## 👀 10. Plagiarism & Academic Misconduct Notice
Your program must be entirely your group's work. Plagiarism detection software will be used to compare all submissions pairwise (including submissions for similar assignments in previous terms) and serious penalties will be applied, including an entry on UNSW's plagiarism register.

You are also not allowed to submit code obtained with the help of ChatGPT, GitHub Copilot, Gemini or similar automatic tools.
* Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531.
* Do not copy ideas or code from others outside your group.
* Do not use a publicly accessible repository or allow anyone outside your group to see your code, except for the teaching staff of COMP1531.
* Code generated by ChatGPT, GitHub Copilot, Gemini and similar AI/LLM tools will be treated as plagiarism.

If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Please refer to the online resources to help you understand what plagiarism is and how it is dealt with at UNSW:
* <a href="https://www.student.unsw.edu.au/plagiarism/integrity">Academic Integrity and Plagiarism</a>
* <a href="https://www.unsw.edu.au/content/dam/pdfs/governance/policy/2022-01-policies/plagiarismpolicy.pdf">UNSW Plagiarism Policy</a>

The course reserves the right to reassess whether you meet course outcomes through a similar assessment under significant suspicion of academic misconduct.

## ©️ Copyright Notice
Reproducing, publishing, posting, distributing or translating this assignment is an infringement of copyright and will be referred to UNSW Student Conduct and Integrity for action.
