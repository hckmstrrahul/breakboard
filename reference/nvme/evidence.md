# Samsung 990 PRO — specimen lock

Selected hardware: **MZ-V9P2T0BW, 2 TB, original October 2022 bare drive**, matched to the PCB photographed in Simon Crisp’s KitGuru review dated 19 October 2022. The selected board is single-sided. Neither the 1 TB nor 4 TB board nor the heatsink version is mixed into the geometry. The PCB revision silk is not reliably legible in the selected photograph, so the physical specimen is the revision boundary; no revision code is invented.

## Primary evidence

- [Samsung 2022 datasheet, Revision 1.0](https://download.semiconductor.samsung.com/resources/data-sheet/Samsung_NVMe_SSD_990_PRO_Datasheet_Rev.1.0_10129514049640.pdf), technical table on PDF page 3 and model table on page 4: 80 × 22 × at most 2.3 mm, M.2 2280, PCIe 4.0 ×4 / NVMe 2.0, 2 GB LPDDR4 for the 2 TB model.
- [KitGuru’s first-hand physical specimen](https://www.kitguru.net/components/ssd-drives/simon-crisp/samsung-990-pro-2tb-review/2/): original photographs and direct observation of the nickel-coated Pascal controller, two NAND packages, cache and copper-backed rear label. This is a primary specimen report rather than a second-hand architecture description.
- [Full PCB photograph](https://www.kitguru.net/wp-content/uploads/2022/10/Samsung-SSD990-PRO-2TB-Review-on-KitGuru-PCB.jpg), inspected at original 2048 px width: **S4LV008** controller, two **K9DVGY8JRD-DCK0** packages; front and rear photos were also inspected. Photographs are reference-only, not copied into the web model.
- [TE M-key socket specification](https://www.te.com/en/product-1-2199230-6.html): 0.5 mm pitch and 67 positions. The board model has 34 upper and 33 lower contact pads, staggered by 0.25 mm, with the physical M-key notch.

## Feature truth

| Feature | Classification and boundary |
|---|---|
| 2 TB configuration, interface, DRAM capacity and outer dimensions | Documented by Samsung. |
| One-sided population, controller marking, two NAND markings and relative layout | Observed in the single selected specimen. |
| Package footprint and small passive placement | Photo-estimated; not measured with calipers or imported from a PCB CAD file. |
| Nickel finish and rear copper-backed label | Observed/documented by the specimen author; layer thickness is representative. |
| Controller die, BGA maps and functional regions | Representative cutaway. No transistor map or true package pinout is claimed. |
| Sixteen 512 Gb dies per NAND package | **Capacity inference**, from 2 TB in two packages and the specimen’s stated 512 Gb V7 dies; not a confirmed decapsulation. |
| Die shapes, staggering, internal pads and substrate routing | Representative. The 176 memory levels are within each silicon die, not 176 separate die sheets. |
| Board surface trace suggestions | Representative, not recovered Gerbers. |
| Read/write flow | Architectural explanation, not literal PCB traces or a benchmark. DRAM’s metadata/buffering path is a branch, not a mandatory serial path for all data. |

## Behavior and checks

Read and Write reverse the host/controller/NAND direction. Activity changes particle rate and zero activity hides them. Physical silicon and packages remain stationary. Pause holds the explanatory state; reset restores Read, 50% activity and the initial phase. Selection, isolation, separation and reduced motion hide the moving overlay. Desktop and mobile renders are captured through the actual shared scene in `/tmp/breakboard-storage`; the independent checker owns release approval.
