It sets the record id to 000000000
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
008    somerandom008content
HLI    ‡aTEST-HLI
100    ‡aTest Author
245    ‡aSome content
700 1  ‡aLindholm, Johanna,‡ekirjoittaja,‡evalokuvaaja.
SID    ‡c(ANDL100013)1452028‡bander
LOW    ‡aANDER
STA    ‡aTEST-STA
264 11 ‡aHelsinki‡312
264 11 ‡aHelsinki‡3ab‡c2345678
264  3 ‡aHelsinki
264 11 ‡aEspoo‡btesti‡3ab‡c2345678
264 11 ‡aEspoo‡3ab‡c2345678
264 11 ‡aHelsinki
264 11 ‡aHelsinki‡3ab
264 11 ‡aEspoo‡bauto‡3ab‡c2345678
264 11 ‡aHelsinki‡3ab‡c1234567
264  1 ‡aHelsinki
264 31 ‡aHelsinki
500    ‡aTakakannessa tasku.
500    ‡aXylofoni takakannessa.
500    ‡aEtukannessa tasku.
650  7 ‡akeittokirjat‡2yso/fin
650  7 ‡aruokaohjeet‡2yso/fin‡9FENNI<KEEP>
650  7 ‡aRUOANVALMISTUS‡2yso/fin
901    ‡aMU20150707‡5FENNI
LOW    ‡aFENNI
LOW    ‡aOULA
CAT    ‡aSomehow a cat field survived
LOW    ‡aVASKI
XYZ    ‡aUnknown fields are last
SID    ‡cFCC007010372‡bfenni
SID    ‡cFCC007010372‡boula
SID    ‡c(ANDL100001)3123396‡bvaski
035    ‡z(FI-MELINDA)007010372
035    ‡z(FI-MELINDA)009346890
001    000000000
583    ‡aMERGED FROM (FI-MELINDA)007010372 + (FI-MELINDA)009346890‡c2016-12-07T13:38:18+02:00‡5MELINDA
650  6 ‡aruokaohjeet‡xlomailu
655  7 ‡akeittokirjat‡2yso/fin‡9FENNI<KEEP>
650  7 ‡aruoanvalmistus‡2bella
650  7 ‡aruoanvalmistus‡2bbb
650  7 ‡aruoanvalmistus‡2kaunokki
650  7 ‡aruoanvalmistus‡2yso/swe
650  7 ‡aruoanvalmistus‡2aaa
650  7 ‡aruoanvalmistus‡2yso/fin‡9FENNI<KEEP>
650  7 ‡amuonanvalmistus‡2yso/fin‡9FENNI<KEEP>

Expected record after postmerge:
LDR    00000_a____
001    000000000
008    somerandom008content
STA    ‡aTEST-STA
035    ‡z(FI-MELINDA)007010372
035    ‡z(FI-MELINDA)009346890
100    ‡aTest Author
245    ‡aSome content
264  1 ‡aHelsinki
264 11 ‡aHelsinki
264 11 ‡aHelsinki‡312
264 11 ‡aHelsinki‡3ab
264 11 ‡aHelsinki‡3ab‡c1234567
264 11 ‡aEspoo‡3ab‡c2345678
264 11 ‡aEspoo‡bauto‡3ab‡c2345678
264 11 ‡aEspoo‡btesti‡3ab‡c2345678
264 11 ‡aHelsinki‡3ab‡c2345678
264 31 ‡aHelsinki
264  3 ‡aHelsinki
500    ‡aEtukannessa tasku.
500    ‡aTakakannessa tasku.
500    ‡aXylofoni takakannessa.
583    ‡aMERGED FROM (FI-MELINDA)007010372 + (FI-MELINDA)009346890‡c2016-12-07T13:38:18+02:00‡5MELINDA
650  6 ‡aruokaohjeet‡xlomailu
650  7 ‡amuonanvalmistus‡2yso/fin‡9FENNI<KEEP>
650  7 ‡aruoanvalmistus‡2yso/fin‡9FENNI<KEEP>
650  7 ‡aruokaohjeet‡2yso/fin‡9FENNI<KEEP>
650  7 ‡akeittokirjat‡2yso/fin
650  7 ‡aRUOANVALMISTUS‡2yso/fin
650  7 ‡aruoanvalmistus‡2yso/swe
650  7 ‡aruoanvalmistus‡2kaunokki
650  7 ‡aruoanvalmistus‡2bella
650  7 ‡aruoanvalmistus‡2aaa
650  7 ‡aruoanvalmistus‡2bbb
655  7 ‡akeittokirjat‡2yso/fin‡9FENNI<KEEP>
700 1  ‡aLindholm, Johanna,‡ekirjoittaja,‡evalokuvaaja.
901    ‡aMU20150707‡5FENNI
LOW    ‡aANDER
LOW    ‡aFENNI
LOW    ‡aOULA
LOW    ‡aVASKI
SID    ‡c(ANDL100013)1452028‡bander
SID    ‡cFCC007010372‡bfenni
SID    ‡cFCC007010372‡boula
SID    ‡c(ANDL100001)3123396‡bvaski
CAT    ‡aSomehow a cat field survived
HLI    ‡aTEST-HLI
XYZ    ‡aUnknown fields are last
