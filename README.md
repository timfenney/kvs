kvs
===

A key value store.

Description
-----------

It's a command line program with 3 keywords: add, get, init, and remove.

Examples
--------

`kvs add [key] [value]`
stores the given value at the specified key

`kvs get [key]`
retrieves the currently stored value for the given key

`kvs remove [key]`
removes the value, if any, stored for the given key from the store

`kvs init`
blows away any existing data if present, and creates a fresh store
 
Approach - Coding
-----------------

In general, I kept everything separate from the beginning, to avoid a single file mess. The original concept was inspired by Redux, as you can probably tell from variable names like `dispatch` and `reducer`. Although I am happy with the architectural concept, there is not 1-1 matching with Redux concepts, so maybe different names would risk less confusion. One interesting benefit of this, is it is relatively easy to add an `undo` keyword; we can implement the store as an Object with a stack of previous states, and the current state.

As I got to some of the other features, and in particular solving the data race problem, I ran out of time to keep things nice, without spending more time on a refactor. Eg. there is exception handling in places it doesn't belong, and `parsing.js` is doing a couple of things outside its scope.

There is a coding strategy I had wanted to try out, so I used it for this small task. I am not sure how much I like it. In a past job, I did some static analysis of source code, and learned from my tools about cyclomatic complexity. Code is more complex if it has more branches. Understanding the penalty of the `if` statement has led to various patterns to code without it (and the ternary operator `?` as well). I employed a strategy to avoid a number of code branches, by using Objects with a discriminant to pick which function implementation to execute. This has the nice result that the implementations are automatically partitioned into sets which are mutually exclusive and cumulatively exhaustive (MECE). (If an unknown implementation is looked up, eg. by `IMPLEMENTATIONS['blerghh']()`, that has the bonus that it will fail. I am only doing lookup by a few known keywords anyway, so the risk seems small.)

Although the above strategy seemed to work ok, as I ran out of budgeted time I let the `if`'s leak back in. I don't think this was so bad, since there were fewer code branches than there would have been had I used only typical branching. Similarly, I tried to prefer `const` to `let`, but due to not segregating functionality as much, I found `let` required to deal with some of the cases with exception handling. That I am less happy about :|

I had some idea of how the app would work, including locking, and some of that intuition turned out not to be correct. This led to the early commitment to an architecture using mostly synchronous function calls. I think this was part of the reason I ended up with concerns leaking accross borders to other files. If I had to do it again, I would probably use exclusively async io.
 
Testing
-------

I like Unit testing, and thought about it, but I prioritized E2E Tests over Unit Tests, and ran out of budgeted time. Probably not having Unit Tests contributed to some of the architectural problems noted above. However I still think I made the right choice, because so many weird things can happen in the Terminal, I just felt safer with tests hitting that system boundary.

I used Jest, and my only gripe is not having a more straightforward api for some kind of `beforeEach()` that `await`ed called functions.

It should be noted, that for manual and automated tests, I only tested under Macos.

Warts
-----

One horrifying problem I didn't look into was a solution to find an appropriate home for the db. The tests passed with it using a directory in the current directory, but this implementation is still a bug. The right way to solve this is to ensure one has a platform-independent way to store app-related stuff. I have only really programmed for Linux/UNIX environments, so I didn't get any farther into this. For a sort of toy type of tool, I would lean towards a `.kvs` folder in the User's home directory, but I don't know how appropriate this is for Windows.

Other than that, it could use some improved error messages, like a proper usage example printed out when bad input is received.

Data Races
----------

The part I am most happy with, is that the store guards against "Time-of-check to time-of-use" bugs with the use of a "lock file"--in this case it is not a file, but a directory. Without this check, `kvs` could not be used reliably from multiple processes.

For example, if two processes, A and B, want to use `kvs` to add a new key to the db, it is possible to interleave requests such that A reads the db, B reads it, A writes a new version of the db with a new key, and then B writes its version of the db. Since B didn't see A's novelty, it is overwritten.
