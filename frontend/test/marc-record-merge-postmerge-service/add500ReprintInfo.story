It infers reprint info from other record and adds it to field 500
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
CAT    ‡aUSER-1‡bTIME-1
CAT    ‡aUSER-2‡bTIME-2

Other record:
LDR    00000_a____
001    28475
008    _______2016___
100    ‡aTest Author
245    ‡aSome content
250    ‡a7. ed

Merged record before postmerge:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content

Expected record after postmerge:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
500    ‡aLisäpainokset: 7. ed 2016.
