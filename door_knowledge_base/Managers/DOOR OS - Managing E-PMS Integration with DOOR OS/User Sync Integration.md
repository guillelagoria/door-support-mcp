# User Sync Integration

**ID:** 24636718400535
**Created:** 2024-07-03T20:12:41Z
**Updated:** 2025-08-08T19:15:36Z
**URL:** https://support.door.com/hc/en-us/articles/24636718400535-User-Sync-Integration

---

<p>With the User Sync integration, residents created in the property management software (PMS) are automatically synced to DOOR OS. This integration saves time for property managers by removing the need to add resident data to multiple systems. </p>
<h3 id="h_01H934A23RRSK8GDFCJDW09QG6">How the integration works</h3>
<p>With the DOOR integration, resident information is pulled from the PMS and automatically populates in the DOOR OS. Synced information includes first name, last name, email, phone number, leasing start and end date, move-in and out date, and unit number.</p>
<p>Syncs occur automatically at a minimum of once per hour. When the PMS syncs with DOOR OS:</p>
<ol>
<li>It checks all people who have previously been synced through this integration and imports any new information into the DOOR OS. If the email address has changed, the sync will not be complete.</li>
<li>If users have a “pending” or “current” status in the PMS and have not yet been added to DOOR OS:</li>
</ol>
<ul>
<li style="list-style-type: none;">
<ul>
<li>Check if there is a user in the DOOR OS with the same first name, last name, and email as the PMS. If everything matches, the user will be synced.</li>
<li>If there’s a partial match (i.e., email addresses match but different names), the user will be flagged, and the property manager can review.</li>
<li>If there’s no match, a new contact will be created in DOOR OS. This contact will be populated with information from the PMS.</li>
<li><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">To manually sync your property management system, go to the "People" tab and click "Sync Now" under "Actions."</span></li>
</ul>
</li>
</ul>
