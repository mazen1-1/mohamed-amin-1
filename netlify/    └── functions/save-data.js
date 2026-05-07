exports.handler = async function (event) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USER  = process.env.GITHUB_USER;
  const GITHUB_REPO  = process.env.GITHUB_REPO;
  const FILE_PATH    = 'videos.json';

  const body = JSON.parse(event.body);
  const content = Buffer.from(
    JSON.stringify(body.data, null, 2)
  ).toString('base64');

  try {
    // نجيب الـ SHA الأول
    const getFile = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    let sha = '';
    if (getFile.ok) {
      const fileData = await getFile.json();
      sha = fileData.sha;
    }

    // نحدث الملف
    const update = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update from Admin',
          content: content,
          sha: sha || undefined,
        }),
      }
    );

    if (!update.ok) {
      const err = await update.json();
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
