const API_BASE_URL = "http://127.0.0.1:5000/api"

export async function getScholarships() {
  const response = await fetch(
    `${API_BASE_URL}/scholarships/`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch scholarships")
  }

  return response.json()
}

export async function getRecommendations(studentProfile) {
  const response = await fetch(
    `${API_BASE_URL}/recommendations/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentProfile),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to generate recommendations")
  }

  return response.json()
}