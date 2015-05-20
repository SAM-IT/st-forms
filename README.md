# st-forms
Form validation library that uses Angular-like syntax.

This library offers some functionality that other form validation libraries seem to be missing.

1. All configuration is done using custom html attributes, this allows for easy cloning.
2. Events are bound on 1 element per form, so cloned inputs automatically get validated as well.
3. Validation can occur on any HTML element, there does not need to be an actual input element.
4. Support for custom getters that modify input data before validation.
5. Each validation callback gets passed ALL form values, this allows for conditional / dependent validation.


# TODO
- A wrapper for Yii1 so CValidators can be used in combination with this validation library.
- A wrapper for Yii2 so Validators can be used in combination with this validation library.
- Add support for AJAX validation.

# NOTES
Configuration is not stored in javascript so it is reread each time validation occurs.
While this is less efficient it is more flexible since it allows easy modification at run time without having to adapt code. (For example dynamic forms where input fields get added by copying from a template will automatically work.)
