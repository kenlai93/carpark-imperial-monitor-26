import axios from "axios";
import dayjs from "dayjs";
import { setTimeout } from "timers/promises";
import { VEHICLE_TYPE, MERCHANT_ID } from "./constants.mjs";

const main = async () => {
    const start = dayjs(new Date());
    const end = start.endOf("month");

    // https://api-enterprise.letspark.com.hk/api/spaces/v2/5d6faa5ae250c83ffe1e5714
    const { data: spacePaginationResponse } = await axios.get(
        `https://api-enterprise.letspark.com.hk/api/spaces/v2/${MERCHANT_ID}`,
        {
            params: {
                type: "Monthly",
                length: 9999,
                page: 1,
                vehicle: VEHICLE_TYPE.MOTORCYCLE,
                start: start.format("YYYY-MM-DDTHH:mm"),
                end: end.format("YYYY-MM-DDTHH:mm"),
            },
        }
    );

    for (const {
        _id: spaceId,
        data: {
            carpark_id: { name_tc, address_tc, ...rest },
        },
    } of spacePaginationResponse.data) {
        await setTimeout(200);

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
            if (data.cartype.includes(VEHICLE_TYPE.MOTORCYCLE) && hasQuota) {
                console.log(
                    address_tc,
                    name_tc,
                    data.monthly?.price,
                    `https://www.impark.com.hk/carparkdetail/${spaceId}`
                );
            }
        }
    }
};

main();
