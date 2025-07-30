import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")

    if (!country) {
      return NextResponse.json({ error: "Country parameter is required" }, { status: 400 })
    }

    // Fetch from your ERP API

    if (!process.env.ERP_USERNAME || !process.env.ERP_ACCESS_TOKEN) {
      throw new Error('ERP_USERNAME and ERP_ACCESS_TOKEN environment variables must be set')
    }

    const erpUrl = `${ process.env.ERP_REST_URL}/Company('${country}')/Location_Card`

    console.log("Fetching from ERP:", erpUrl)

    const response = await fetch(erpUrl, {
    method: 'GET', // or POST, PUT, etc. depending on your needs
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${process.env.ERP_USERNAME}:${process.env.ERP_ACCESS_TOKEN}`).toString('base64')}`,
      'OData-Version': '4.0',
    },
  })

    if (!response.ok) {
      throw new Error(`ERP API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Extract locations from the response
    const locations = data.value || []

    // Transform the data to match our needs
    const transformedLocations = locations.map((location: any) => ({
      Code: location.Code,
      Name: location.Name,
      Zone: location.Zone,
      Address: location.Address,
      City: location.City,
      Country_Region_Code: location.Country_Region_Code,
      Phone_No: location.Phone_No,
      E_Mail: location.E_Mail,
    }))

    return NextResponse.json({
      success: true,
      country,
      locations: transformedLocations,
      count: transformedLocations.length,
    })
  } catch (error) {
    console.error("Error syncing locations:", error)
    return NextResponse.json(
      {
        error: "Failed to sync locations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
