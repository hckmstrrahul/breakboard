# Micron HBM3E evidence record

Locked hardware: **Micron MT65B12G16080A00QG-92:A**, 24 GB, eight-high HBM3E. The 36 GB twelve-high sibling is not mixed into this model. The `:A` suffix is retained; no unverified manufacturing lot is assigned.

## Primary sources

- [Micron exact part page](https://www.micron.com/products/memory/hbm/hbm3e/part-catalog/part-detail/mt65b12g16080a00qg-92-a). Its own public `data-apiresource` endpoint was read on 5 November 2026 and reports **10.98 × 10.98 × 0.78 mm**, WFPGA, MCP, 192Mb ×1088 component configuration and 1.1 V I/O. The page API payload SHA-256 is `7691a1e8ac4ad182d211f57e0eccbdafe38ac9c3c4d1b8279b8c8c7193c274f0`. The API's 1500 MHz clock field is not silently converted into a data-transfer-rate claim; no per-part bandwidth is claimed here.
- [Micron HBM3E technical article](https://www.micron.com/about/blog/applications/ai/microns-hbm3e-powering-the-future-of-ai-with-high-bandwidth-memory): 24 GB eight-high and 36 GB twelve-high configurations, 24 Gb 1β core dies, vertical TSV structure and base-die role.
- [Micron HBM3E family page](https://www.micron.com/products/memory/hbm/hbm3e): 1,024-bit data interface, 16 channels / 32 pseudochannels, eight-high 24 GB option.
- [Micron HBM construction background](https://www.micron.com/products/memory/hbm): vertically joined memory dies and microbump/TSV interconnect roles.

No proprietary package drawing, die photograph, bump map or internal mask layout was available in these public sources. Artwork is procedurally authored, with no third-party photograph embedded.

## Truth table for modeled features

| Feature | Evidence class | Representation |
| --- | --- | --- |
| Product and package envelope | Documented exact part | 10.98 × 10.98 × 0.78 mm; printed ink offset 0.001 mm |
| Stack count/capacity | Documented family configuration tied to exact 24 GB part | Eight 24 Gb memory dies, 24 GB total; one separately counted base die |
| TSVs and inter-die joining | Documented construction | Actual pierced die plates, dielectric sleeves, copper columns and joining bumps |
| Die outline, thickness, spacing | Representative | Eight 0.060 mm core layers on 0.074 mm pitch, above a 0.110 mm base die |
| Via/pad diameters and positions | Representative, enlarged laterally | 48 vias per core as an inspectable subset; not the true quantity or pin map |
| Bottom contact field | Representative | 400 illustrative microbumps; no assertion of actual bump count or pitch |
| 1,024-bit interface | Documented family logical interface | Metadata and explanatory readout; not conflated with total contacts |
| `192Mb ×1088` catalogue configuration | Documented, meaning not reverse-engineered | Not repurposed as a physical 1,088-bump array |
| Bank artwork | Representative | Repeated regions and conductors; not physical bank count or transistor floorplan |
| Molding, markings and base layout | Representative | Source-sized shell with genuine cavity and restrained ink |

Every via sample shares its X/Z location across all eight dies. Copper runs through a real aperture with an annular dielectric sleeve, and the joining bump bridges to the next die. The top/bottom conductors, gaps and component ownership remain coherent through assembly and separation. Small interconnect diameters are enlarged for inspection, while the full assembled height remains at the published value. There is no speculative GPU or branded interposer assembly.

## Interaction contract

Layer and address controls select one of **128 teaching bytes**: eight layers × sixteen addresses. This finite teaching memory is explicitly distinct from the real 24 GB address space and channel mapping. Reset seeds each byte deterministically. Read returns the selected stored value; Write commits the chosen byte after each 1.2-second display transfer while Play runs. Selecting controls while paused never writes memory. Changes are limited to the selected layer/address. Reset restores all original bytes and read mode.

The route is a clearly explanatory overhead path ending at the selected die's edge. Direction reverses between Read and Write; bit colors reflect the payload. Real silicon stays stationary. Pause freezes transfer progress; reduced motion and separation prevent transfers and hide the route; selection/isolation hide explanatory geometry. No actual HBM latency or bandwidth is inferred from the animation.

## Maker verification

The maker checks the exact outer envelope, eight physically separated core volumes, real holes, copper/sleeve/bump continuity, deterministic read/write and frame-rate-independent commit counts, pause/reset, separation and reduced motion. Browser proofs cover both themes, assembled/exploded/Play/anatomy, closeups and 390 px. Final rendered results and performance are added after the visual correction pass; independent checker approval remains required.

Maker result (5 November 2026): all eight physical die spans and their gaps pass; raycasts confirm all 384 authored through-silicon holes are open before their separate conductors are considered. Package bounds, sample-address isolation, delayed write commit, subsequent read, deterministic reset and 30/120 Hz operation pass. Real Chrome/Metal light/dark, anatomy/material, assembled/exploded/Play and 390 px captures were inspected without WebGL/page errors. An isolated 600-frame CPU render loop measured p95 0.3 ms for both normal and anatomy (max 0.8/0.6 ms respectively). A concurrent first profile had one 230 ms outlier during other browser capture work; the isolated rerun did not reproduce it. These are CPU submission measurements, not GPU FPS or physical-phone benchmarks.
