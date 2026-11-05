# Nikon FM3A shutter — evidence lock

## Selected assembly

**1B060-746 shutter unit**, Nikon FM3A, original June2001 parts list **FAA38001-R.3538.A** (FAA38001 silver camera, FAA38051 black camera). The separate shutter-control unit is1B060-747; that full camera dial assembly is not included. This is not an FM2 honeycomb-titanium curtain variant.

Primary manufacturer-authored sources:

- [Nikon FM3A history and shutter photograph](https://imaging.nikon.com/imaging/information/chronicle/history-fm3a/): vertical metal focal-plane shutter,24×36mm gate, manual mechanical1s–1/4000s, electronic A mode,1/250s flash synchronization, separate mechanical/electronic stop shoes, front/rear release-delay explanation.
- [Nikon original parts list, archived mirror](https://archive.org/download/repaircameras-nikon-fm3a-parts-list/nikon-fm3a-parts-list.pdf): title page June2001; Fig11 illustrates unit; printed parts-list page1 (PDF16) identifies1B060-746. Original authored by Nikon, hosted by Internet Archive. Local `/tmp/breakboard-optics/fm3a-lock.png` and `fm3a-fig11.png` were visually inspected.
- [Nikon original FM3A sales sheet, mirror](https://www.gerardobonomo.it/wp-content/uploads/2020/04/fm3a_brochure.pdf): aluminum-alloy curtains, manual/electronic control split. Manufacturer-authored source; mirror hosting is disclosed.
- [Nikon repair manual, archived mirror](https://archive.org/download/repaircameras-nikon-fm3a-service-manual/nikon-fm3a-service-manual.pdf): original document downloaded. It does not provide an internal shutter blade manufacturing drawing.

## Feature truth

| Feature | Status |
|---|---|
| Unit identifier and 2001 configuration | Documented in original Nikon parts list. |
| Gate36×24mm, two-curtain vertical traversal | Documented. Apertures are genuine through-openings. |
| Aluminum-alloy curtain material | Documented in Nikon sales sheet; no honeycomb texture added. |
| Outer plate outline, protruding mechanism column, finish | Estimated from Nikon’s unit photograph. 59 × 53 × 11 mm modeled envelope is an estimate, not a factory dimension. |
| Four leaves per group | **Representative.** Factory leaf count is not established by these sources. |
| Straight guides, leaf followers, hidden coupling | **Representative explanatory construction.** This does not recreate the actual production fan linkage. |
| Spring barrels, gear tooth counts, escapement layout | Representative hidden components; no manufacturing/repair accuracy claimed. |
| Two release shoes | Architecture documented; exact shape/position representative. Electronic shoe remains retracted in this manual-mode demonstration. |
|3.5ms transit | Representative, compatible with documented1/250s synchronization; not a measured FM3A curtain-travel specification. |

## Functional model and limits

Both curtain edges traverse the full24mm gate at the same speed. The second release is delayed by exactly the selected exposure interval. Thus each image row receives the same exposure regardless of slit width. Settings1/30,1/60,1/125,1/250,1/500,1/1000,1/2000 and1/4000 are available. Both delay and traversal are multiplied by180 for display; nominal moving slit is min(24,24×exposure/.0035)mm. A separate, explicitly illustrative cocking phase moves both groups together with the gate covered. Pause freezes pose; reset restores1/250s and ready pose. Reduced motion and separation park the physical leaves in ready pose. Selection hides the explanatory gate-light overlay.

The educational leaf suspension is not presented as a serviceable reproduction of the unpublished FM3A mechanism. The camera mirror, film transport, lens and complete external speed-dial control unit are outside this standalone shutter view.

## Verification

Actual browser rendering completed in both themes, assembled, fully separated, Play and close views without errors. Numerical coverage/timing, no-intersection and pause/reset checks are in `/tmp/breakboard-optics`. Independent checker owns final release approval.
