# NVIDIA Jetson Orin Nano Super — model evidence

Intended use: interactive educational 3D teardown in the existing web application, assembled and exploded states, with orbit/top/front views and PNG export. This is a mechanically grounded reference model, not a fabrication or electrical simulation.

| Feature group | Evidence kind | Implementation / limits |
| --- | --- | --- |
| Carrier outline, holes, connector positions | Supplied geometry and dimensions | NVIDIA `P3766-P3768SKU4-P3767ENVELOPE.stp`; 100 × 79 mm PCB, 1.57 mm thickness. Preserved tessellated geometry, transformed only from CAD Z-up to scene Y-up. |
| USB, Ethernet, DisplayPort, USB-C, DC jack | Supplied exterior envelopes, reconstructed interiors | The supplied port bodies are closed envelopes. These 73 source shapes are replaced by open receptacles at their CAD positions and envelope sizes. Four blue USB-A sockets, asymmetrical DisplayPort rather than HDMI, pill-profile USB-C, recessed RJ45 and black DC housing with a circular bore. Recessed contacts, tongues and shell thicknesses are illustrative. |
| Heatsink, fan/motor/impeller, fasteners, spring clip | Supplied geometry | Original CAD geometry. Heatsink is 57.8 × 39 mm plan envelope; approximately 35 mm impeller. Black anodized and polymer finishes reconstructed. |
| Orin Nano compute module | Supplied envelope geometry | NVIDIA explicitly publishes a module **envelope** in this assembly. The module is selectable as one component. No individual die, RAM placement, or thermal interface construction is inferred. Source edge contacts retained. |
| Module socket and retention arms | Supplied geometry | Source socket and its contact geometry. |
| GPIO header | Supplied geometry and documented count | Female 2 × 20, 2.54 mm pitch. Source header body and cavities retained, black housing with gold underside contact tails. |
| Camera and M.2 sockets | Supplied geometry and official interface documentation | Two 22-position CSI connectors; underside two Key-M and one Key-E socket. |
| Wireless card, antenna boards and cable route | Supplied geometry | Kept from source assembly as one group. The source represents an envelope for the wireless card. |
| SMD bodies and source pads | Supplied geometry | Carrier body/shell pairs grouped together. SMD components combined into one selectable group. Values and electrical identities not inferred. |
| Support base | Supplied geometry | Original moulded base and four mounting screws, separated downwards. |
| Optional example SSD | Supplied geometry, omitted | 107 solids belonging to the example M.2 2230 SSD and its screw are omitted because the stock developer kit does not include an NVMe drive. Sockets and standoffs remain. |
| Materials and printed markings | Photo-informed reconstruction | Colors are semantic reconstructed finishes, not measured spectral materials. Markings are identifying text only. |
| “Super” distinction | Official documentation | Super is achieved through software/power-profile updates on the existing Orin Nano hardware. No fictitious extra chip or different carrier is added. |

## Sources

- [Official 3D STEP download](https://developer.nvidia.com/downloads/assets/embedded/secure/jetson/orin_nano/docs/jetson_orin_nano_devkit_3d_step_model.zip/)
- [Carrier board specification, SP-11324-001 v1.3](https://developer.nvidia.com/downloads/assets/embedded/secure/jetson/orin_nano/docs/jetson_orin_nano_devkit_carrier_board_specification_sp.pdf), particularly figures 1-2–1-5 and 4-1–4-2.
- [Hardware layout](https://docs.nvidia.com/jetson/orin-nano-devkit/user-guide/latest/hardware_layout.html)
- [Super kit introduction](https://docs.nvidia.com/jetson/orin-nano-devkit/user-guide/latest/index.html)

Downloaded source retained in this directory. Source geometry is NVIDIA reference CAD and remains subject to the source download terms; this reconstruction does not relicense NVIDIA CAD.

## Rebuild

```sh
python3 scripts/import-jetson.py
node scripts/package-jetson.mjs
npm run build
npm run check
```

`import-jetson.py` requires cadquery-ocp and uses 0.08 mm tessellation tolerance / 0.65 rad angular tolerance. `package-jetson.mjs` converts [x,y,z] to [x−46,z−0.785,22.5−y], assigns source-derived groups and finishes, and writes `public/models/jetson.json.gz` and `source-groups.json`.

Maker verification: 1,920 source shapes; 1,740 retained, 107 optional SSD shapes omitted, 73 closed port-envelope shapes replaced with reconstructed open receptacles; 267,668 retained CAD triangles. All 15 groups have finite geometry, stay above the floor at 0/50/100% explosion, return to assembled origin, and isolate as exactly one group. Independent checker caught a 2.1 mm printed-decal overhang beyond the heatsink; its width was reduced to stay inside the original 57.8 mm envelope. Browser verification and other independent checker findings are recorded by the integration review.
