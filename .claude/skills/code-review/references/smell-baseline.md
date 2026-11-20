# The smell baseline

On top of whatever the repo documents, the Standards axis always carries this
fixed set of Fowler code smells (*Refactoring*, chapter 3). It applies even
when a repo documents nothing.

Two rules bind it:

- **The repo overrides.** A documented repo standard always wins. Where the
  repo endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible
  Feature Envy"), never a hard violation. As with any standard here, skip
  anything tooling already enforces.

Each entry reads *what it is*, then *how to fix*. Match them against the diff.

- **Mysterious Name** - a function, variable or type whose name does not
  reveal what it does or holds. Rename it; if no honest name comes, the
  design is murky.
- **Duplicated Code** - the same logic shape appears in more than one hunk or
  file in the change. Extract the shared shape, call it from both.
- **Feature Envy** - a method that reaches into another object's data more
  than its own. Move the method onto the data it envies.
- **Data Clumps** - the same few fields or parameters keep travelling
  together, a type wanting to be born. Bundle them into one type, pass that.
- **Primitive Obsession** - a primitive or string standing in for a domain
  concept that deserves its own type. Give the concept its own small type.
- **Repeated Switches** - the same switch or if-cascade on the same type
  recurs across the change. Replace with polymorphism, or one map both sites
  share.
- **Shotgun Surgery** - one logical change forces scattered edits across many
  files in the diff. Gather what changes together into one module.
- **Divergent Change** - one file or module is edited for several unrelated
  reasons. Split so each module changes for one reason.
- **Speculative Generality** - abstraction, parameters or hooks added for
  needs the spec does not have. Delete it; inline back until a real need
  shows.
- **Message Chains** - long `a.b().c().d()` navigation the caller should not
  depend on. Hide the walk behind one method on the first object.
- **Middle Man** - a class or function that mostly just delegates onward. Cut
  it, call the real target directly.
- **Refused Bequest** - a subclass or implementer that ignores or overrides
  most of what it inherits. Drop the inheritance, use composition.
