import axios from "axios";
import { setTimeout } from "timers/promises";
import dayjs from "dayjs";

const VEHICLE_TYPE_MOTORCYCLE = "5d709ef4e250c856821e57d8";

const main = async () => {
    const start = dayjs(new Date());
    const end = start.endOf("month");

    const { data: spacePaginationResponse } = await axios.get(
        "https://api-enterprise.letspark.com.hk/api/spaces/v2/5d6faa5ae250c83ffe1e5714",
        {
            params: {
                type: "Monthly",
                length: 9999,
                page: 1,
                vehicle: VEHICLE_TYPE_MOTORCYCLE,
                start: start.format("YYYY-MM-DDTHH:mm"),
                end: end.format("YYYY-MM-DDTHH:mm"),
            },
        }
    );

    for (const {
        _id: spaceId,
        data: {
            carpark_id: { name_tc, address_tc },
        },
    } of spacePaginationResponse.data) {
        await setTimeout(1000);

        const { data: spaceDetailsResponse } = await axios.get(
            `https://api-enterprise.letspark.com.hk/api/spaces/carpark/${spaceId}`,
            {
                params: {
                    type: "Monthly",
                },
            }
        );

        for (const { data } of spaceDetailsResponse) {
            const hasQuota = data.quota > data.booked.length;
            if (data.cartype.includes(VEHICLE_TYPE_MOTORCYCLE) && hasQuota) {
                console.log(name_tc, address_tc);
            }

            // if (data.cartype.includes(VEHICLE_TYPE_MOTORCYCLE) && data.actualQuota > 0) {
            //     console.log(name_tc, address_tc);
            // }
        }
    }
};

main();
