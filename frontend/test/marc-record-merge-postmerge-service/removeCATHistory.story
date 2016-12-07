It removes all CAT fields from merged record
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
100    ‡aTest Author
245    ‡aSome content

Merged record before postmerge:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
CAT    ‡aUSER-1‡bTIME-1
CAT    ‡aUSER-2‡bTIME-2

Expected record after postmerge:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content