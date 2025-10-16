# Troubleshooting Firewall with Latch Camera

**ID:** 24603717115415
**Created:** 2024-07-02T18:57:07Z
**Updated:** 2024-07-17T15:13:59Z
**URL:** https://support.door.com/hc/en-us/articles/24603717115415-Troubleshooting-Firewall-with-Latch-Camera

---

<p><span style="font-weight: 400;">I</span><span style="font-weight: 400;">f the</span><span style="font-weight: 400;"> camera is being installed behind a firewall, modifications may need to be made for the camera to work properly. At a minimum, the following requirements must be met:</span></p>
<ul>
<li style="font-weight: 400;" aria-level="1"><span style="font-weight: 400;">Open all destinations on TCP port 443, 3478, 5349 and 8883</span></li>
<li style="font-weight: 400;" aria-level="1"><span style="font-weight: 400;">Open all UDP ports in both directions</span></li>
<li style="font-weight: 400;" aria-level="1"><span style="font-weight: 400;">Add/Allow the following domains:</span></li>
</ul>
<p><strong>*.latchaccess.com</strong><strong><br></strong><strong>*.latch.com</strong><strong><br></strong><strong>*.amazonaws.com</strong></p>
<p><span style="font-weight: 400;">Additionally, full cone NAT configuration is recommended. At a minimum, some NAT is required (otherwise the camera will be exposed to endless attacks). In summary, make sure your router, firewall or networking device </span><strong>doesn't</strong><span style="font-weight: 400;"> block </span><strong>incoming</strong><span style="font-weight: 400;"> and </span><strong>outgoing</strong><span style="font-weight: 400;"> traffic on the following ports and domains:</span></p>
<p> </p>
<p><span style="font-weight: 400;">TCP Outbound</span></p>
<p><span style="font-weight: 400;">443</span></p>
<p><span style="font-weight: 400;">3</span><span style="font-weight: 400;">478</span></p>
<p><span style="font-weight: 400;">5349</span></p>
<p><span style="font-weight: 400;">8883</span></p>
<p> </p>
<p><span style="font-weight: 400;">UDP Inbound and Outbound</span></p>
<p><span style="font-weight: 400;">1025-65535 </span></p>
<p> </p>
<p><span style="font-weight: 400;">If video feeds still aren’t loading, all ports to the camera may need to be opened.</span></p>
<p> </p>
<p><span style="font-weight: 400;">If video feeds are working &lt;90% of the time or not at all, ask the integrator if they are using a SonicWall firewall. Contact Door Support for help with SonicWall firewalls.</span></p>
