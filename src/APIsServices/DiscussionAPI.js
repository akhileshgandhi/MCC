// ============================================
// IEP DISCUSSION / COMMENTS API - JAVASCRIPT
// ============================================

/**
 * Fetch discussions for a specific IEP filtered by department
 * Only shows discussions created by the current user
 */
export async function fetchDiscussionsByIEP(_sp, iepId, departmentId, currentUserId) {
  try {
    const items = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .top(5000)
      .select(
        "*",
        "Id",
        "Comment",
        "ParentCommentId",
        "IEP/Id",
        "Department/Id",
        "Author/Id",
        "Author/Title",
        "Created",
        "Modified",
        "MentionedUsers/Id",
        "MentionedUsers/Title",
        "MentionedUsers/EMail"
      )
      .expand("IEP", "Department", "Author", "MentionedUsers")
      .filter(`IEP/Id eq ${iepId} and Department/Id eq ${departmentId} and Author/Id eq ${currentUserId}`)
      .orderBy("Created", false)();

    console.log(items, "discussion items");
    return items;

  } catch (error) {
    console.error("Error fetching IEP discussions:", error);
    throw error;
  }
}

/**
 * Create a new discussion comment
 */
export async function createDiscussionComment(_sp, data) {
  try {
    const itemData = {
      Comment: data.Comment,
      IEPId: data.IEPId,
      DepartmentId: data.DepartmentId
    };

    // Add the item first
    const addResult = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .add(itemData);

    const itemId = addResult.data.Id;

    // If there are mentioned users, update the item
    if (data.MentionedUserIds && data.MentionedUserIds.length > 0) {
      await _sp.web.lists
        .getByTitle("IEPDiscussions")
        .items
        .getById(itemId)
        .update({
          MentionedUsersId: data.MentionedUserIds 
        });
    }

    console.log("Discussion comment created successfully");
    return addResult.data;

  } catch (error) {
    console.error("Error creating discussion comment:", error);
    throw error;
  }
}

/**
 * Create a reply to an existing comment
 */
export async function createDiscussionReply(_sp, data) {
  try {
    const itemData = {
      Comment: data.Comment,
      IEPId: data.IEPId,
      DepartmentId: data.DepartmentId,
      ParentCommentId: data.ParentCommentId
    };

    // Add the reply
    const addResult = await _sp.web.lists
      .getByTitle("IEPDiscussions")
      .items
      .add(itemData);

    const itemId = addResult.data.Id;

    // If there are mentioned users, update the item
    if (data.MentionedUsersIds && data.MentionedUsersIds.length > 0) {
      await _sp.web.lists
        .getByTitle("IEPDiscussions")
        .items
        .getById(itemId)
        .update({
          MentionedUsersId: data.MentionedUsersIds 
        });
    }

    console.log("Discussion reply created successfully");
    return addResult.data;

  } catch (error) {
    console.error("Error creating discussion reply:", error);
    throw error;
  }
}
