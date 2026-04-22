// import { GraphFI } from "@pnp/graph";
// import "@pnp/graph/users";
// import "@pnp/graph/groups";
// import "@pnp/graph/members";

// /**
//  * Checks if the current user is a member of a specific AD group using Microsoft Graph
//  * @param graph GraphFI instance
//  * @param groupNameOrId The name or ID of the AD group
//  * @returns Promise<boolean>
//  */
// export const isUserInADGroup = async (graph: GraphFI, groupNameOrId: string): Promise<boolean> => {
//     try {
//         // 1. Get the current user's ID
//         const user = await graph.me();
//         const userId = user.id;

//         // 2. Find the group by name or ID
//         // If it looks like a GUID, treat as ID, otherwise as Display Name
//         let groupId = groupNameOrId;
//         const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

//         if (!guidRegex.test(groupNameOrId)) {
//             const groups = await graph.groups.filter(`displayName eq '${groupNameOrId}'`)();
//             if (groups.length === 0) {
//                 console.error(`Group '${groupNameOrId}' not found.`);
//                 return false;
//             }
//             groupId = groups[0].id;
//         }

//         // 3. Check membership
//         // memberOf returns direct and transitive (nested) groups if using /memberOf
//         // However, checking if a user is in a group is often done via /groups/{id}/members
//         // We can use the checkMemberGroups graph call which is very efficient for this

//         const result = await graph.me.checkMemberGroups([groupId]);
//         return result.indexOf(groupId) > -1;

//     } catch (error) {
//         console.error("Error checking AD group membership:", error);
//         return false;
//     }
// };

// /**
//  * Gets all AD groups the current user is a member of
//  * @param graph GraphFI instance
//  * @returns Promise<string[]> Array of group IDs
//  */
// export const getUserADGroups = async (graph: GraphFI): Promise<string[]> => {
//     try {
//         const groups = await graph.me.getMemberGroups(false);
//         return groups;
//     } catch (error) {
//         console.error("Error getting user AD groups:", error);
//         return [];
//     }
// };
// /**
//  * Gets members of a specific AD group by group name
//  * @param graph GraphFI instance
//  * @param groupName The display name of the AD group
//  * @returns Promise<{id: string, title: string, email: string}[]> Array of group members
//  */
// export const getADGroupMembers = async (graph: GraphFI, groupName: string): Promise<{id: string, title: string, email: string}[]> => {
//     try {
//         // Find the group by display name
//         const groups = await graph.groups.filter(`displayName eq '${groupName}'`)();
//         if (groups.length === 0) {
//             console.error(`Group '${groupName}' not found.`);
//             return [];
//         }

//         const groupId = groups[0].id;

//         // Get all members of the group
//         const members = await graph.groups.getById(groupId).members();

//         // Filter and format user members only (excluding nested groups)
//         const users = members
//             .filter((member: any) => member['@odata.type'] === '#microsoft.graph.user')
//             .map((user: any) => ({
//                 id: user.id,
//                 title: user.displayName,
//                 email: user.mail || user.userPrincipalName
//             }));

//         return users;
//     } catch (error) {
//         console.error(`Error getting members from AD group '${groupName}':`, error);
//         return [];
//     }
// };

import { GraphFI } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/groups";
import "@pnp/graph/members";
import { MSGraphClientV3 } from "@microsoft/sp-http";
/**
 * Checks if the current user is a member of a specific AD group using Microsoft Graph
 * @param graph GraphFI instance
 * @param groupNameOrId The name or ID of the AD group
 * @returns Promise<boolean>
 */
export const isUserInADGroup = async (graph: GraphFI, groupNameOrId: string): Promise<boolean> => {
    try {
        // 1. Get the current user's ID
        const user = await graph.me();
        const userId = user.id;

        // 2. Find the group by name or ID
        // If it looks like a GUID, treat as ID, otherwise as Display Name
        let groupId = groupNameOrId;
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!guidRegex.test(groupNameOrId)) {
            const groups = await graph.groups.filter(`displayName eq '${groupNameOrId}'`)();
            if (groups.length === 0) {
                console.error(`Group '${groupNameOrId}' not found.`);
                return false;
            }
            groupId = groups[0].id;
        }

        // 3. Check membership
        // memberOf returns direct and transitive (nested) groups if using /memberOf
        // However, checking if a user is in a group is often done via /groups/{id}/members
        // We can use the checkMemberGroups graph call which is very efficient for this

        const result = await graph.me.checkMemberGroups([groupId]);
        return result.indexOf(groupId) > -1;

    } catch (error) {
        console.error("Error checking AD group membership:", error);
        return false;
    }
};

/**
 * Gets all AD groups the current user is a member of
 * @param graph GraphFI instance
 * @returns Promise<string[]> Array of group IDs
 */
export const getUserADGroups = async (graph: GraphFI): Promise<string[]> => {
    try {
        const groups = await graph.me.getMemberGroups(false);
        console.log(`User is a member of ${groups.length} AD groups.`);

        return groups;
    } catch (error) {
        console.error("Error getting user AD groups:", error);
        return [];
    }
};

/**
 * Gets members of a specific AD group by group name.
 * Supports pagination for large groups (handles 1000+ members).
 * @param graph GraphFI instance
 * @param groupName The display name of the AD group  
 * @param graphClient Optional MSGraphClientV3 for pagination support
 * @returns Promise<{id: string, title: string, email: string}[]> Array of group members
 */
export const getADGroupMembers = async (
    graph: GraphFI,
    groupName: string,
    graphClient?: MSGraphClientV3
): Promise<{ id: string; title: string; email: string }[]> => {
    try {
        // Step 1: Find the group by display name
        const groups = await graph.groups.filter(`displayName eq '${groupName}'`)();
        if (groups.length === 0) {
            console.error(`Group '${groupName}' not found.`);
            return [];
        }

        const groupId = groups[0].id;
        console.log(`Found AD Group: "${groupName}" => ID: ${groupId}`);

        const allMembers: { id: string; title: string; email: string }[] = [];

        // If graphClient is provided, use it for pagination
        if (graphClient) {
            let nextUrl: string | null = `/groups/${groupId}/members?$select=id,displayName,mail,userPrincipalName&$top=999`;
            let pageCount = 0;

            while (nextUrl) {
                pageCount++;
                
                // Use MSGraphClient to make the request
                const response = await graphClient
                    .api(nextUrl)
                    .version('v1.0')
                    .get();

                console.log(`Fetching page ${pageCount} - received ${response.value?.length || 0} members`);

                // Process current page
                if (response.value && Array.isArray(response.value)) {
                    const totalInPage = response.value.length;
                    const usersOnly = response.value.filter((member: any) => member["@odata.type"] === "#microsoft.graph.user");
                    console.log(`  - Users in page ${pageCount}: ${usersOnly.length} out of ${totalInPage} members`);
                    
                    let addedFromPage = 0;
                    let skippedNoEmail = 0;
                    let skippedNoTitle = 0;
                    
                    usersOnly.forEach((user: any) => {
                        const email = user.mail || user.userPrincipalName || "";
                        const title = user.displayName || "";
                        
                        if (email && title) {
                            allMembers.push({
                                id: user.id,
                                title,
                                email,
                            });
                            addedFromPage++;
                        } else {
                            if (!email) skippedNoEmail++;
                            if (!title) skippedNoTitle++;
                        }
                    });
                    
                    console.log(`  - Added ${addedFromPage} users from page ${pageCount} (Skipped: ${skippedNoEmail} no email, ${skippedNoTitle} no title)`);
                }

                // Check for next page - extract path and remove /v1.0/ prefix if present
                if (response["@odata.nextLink"]) {
                    const url = new URL(response["@odata.nextLink"]);
                    let path = url.pathname + url.search;
                    // Remove /v1.0/ prefix since .version() will add it
                    if (path.startsWith('/v1.0/')) {
                        path = path.substring(6); // Remove '/v1.0/'
                    }
                    nextUrl = path;
                    console.log(`  - Next page URL: ${nextUrl.substring(0, 100)}...`);
                } else {
                    nextUrl = null;
                    console.log(`  - No more pages`);
                }
            }

            console.log(`✓ Total members fetched from "${groupName}": ${allMembers.length} users from ${pageCount} pages`);
        } else {
            // Fallback: Use PnPjs (will only get first page - 100 members)
            console.warn('MSGraphClient not provided - pagination not supported. Only first 100 members will be returned.');
            const members = await graph.groups
                .getById(groupId)
                .members
                .top(999)
                .select("id,displayName,mail,userPrincipalName")();

            members
                .filter((member: any) => member["@odata.type"] === "#microsoft.graph.user")
                .forEach((user: any) => {
                    const email = user.mail || user.userPrincipalName || "";
                    const title = user.displayName || "";
                    if (email && title) {
                        allMembers.push({
                            id: user.id,
                            title,
                            email,
                        });
                    }
                });

            console.log(`Total members fetched from "${groupName}": ${allMembers.length} (no pagination)`);
        }

        return allMembers;

    } catch (error) {
        console.error(`Error getting members from AD group '${groupName}':`, error);
        return [];
    }
};