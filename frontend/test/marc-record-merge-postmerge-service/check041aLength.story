Adds note if the merged record has broken 041a field
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content

Merged record before postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content

Expected record after postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content

Notes: Record has 041a field with length less than 3. This may break when saved to aleph.