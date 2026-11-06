# RUI-AUTH-ENUM-001

Proposed hub rule. Not applied in the hub yet.

## Rule

Recovery and verification copy must not reveal whether an address has an account.

The sentence shown after a reset request, a resend, or a failed send is the same if the address is registered and if it is not. The component does not render `Error.message` from the host. A link that is invalid or expired talks about the link, not about a missing account.

## Why

Account enumeration lets someone probe which emails are registered. The catalog already had sign-in, login, and signup, and none of them stated this. The recovery cards are the first place the leak is easy to ship by accident.

## Check

A unit test submits two addresses, and one host rejection whose message names the address. The visible copy matches the locale sentence and does not contain the rejection text.
