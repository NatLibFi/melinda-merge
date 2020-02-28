Candidate is valid if both records have same f33Xs
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent
337    ‡akäytettävissä ilman laitetta‡bn‡2rdamedia
338    ‡anide‡bnc‡2rdacarrier


Other record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent
337    ‡akäytettävissä ilman laitetta‡bn‡2rdamedia
338    ‡anide‡bnc‡2rdacarrier


Expected to be valid: true



Candidate is invalid if records have different f33Xs
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
337    ‡akäytettävissä ilman laitetta‡bn‡2rdamedia

Other record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
337    ‡amikromuoto‡bh‡2rdamedia

Expected to be valid: false
Expected failure message: Records have different 33X fields: 337



Candidate is invalid if records have different number of f33Xs
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent
337    ‡astillkuva‡bsti‡2rdacontent

Other record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent

Expected to be valid: false
Expected failure message: Records have different 33X fields: 337



Candidate is invalid if both records have different number or different f33Xs
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent
337    ‡astillkuva‡bsti‡2rdacontent
338    ‡anide‡bnc‡2rdacarrier

Other record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
336    ‡ateksti‡btxt‡2rdacontent
337    ‡amikromuoto‡bh‡2rdamedia

Expected to be valid: false
Expected failure message: Records have different 33X fields: 337,338