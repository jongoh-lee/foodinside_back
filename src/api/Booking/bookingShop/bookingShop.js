import { sendReservationConfirmMail } from "../../../utils";
import { prisma } from "../../../../generated/prisma-client";
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AT;
const client = require('twilio')(accountSid, authToken);

export default {
    Mutation:{
        bookingShop: async(_, args, {request, isAuthenticated}) => {
            isAuthenticated(request);
            const { user } = request;
            const { ownerId, firstDate, lastDate, totalPrice, username, contact, prices, account} = args;
            const profile = await prisma.user({id: user.id}).profile()
            //예약 유무를 확인 합니다.
            let priceIdList = [];
            prices.map(el => priceIdList.push(el.id));
            let priceIdInput = [];
            prices.map(el => priceIdInput.push({ id : el.id}));

            const bookedDates = await prisma.prices({
                where: {
                    id_in: priceIdList,
                    OR:[{
                        isBooked:true,    
                    },{
                        priceState_in: ["self", "undefined"]
                    }]
                },
            });

            if(account){
                await prisma.updateProfile({
                    where:{
                        id: profile.id
                    },
                    data:{
                        account:{
                            create:{
                                bank: account.bank,
                                accountNumber: account.accountNumber,
                                accountHolder: account.accountHolder
                            }
                        }
                    }
                })
            }

            if(bookedDates.length > 0){
                throw Error("방금 누군가 먼저 예약했습니다.")
            }else{
                const filterOptions = {
                    AND: [
                        {
                            profile: {
                                id: profile.id
                            }
                        },
                        {
                            owner: {
                                id: ownerId
                            }
                        }
                    ]
                };
                try{
                    //문자 + 이메일 보내기
                    await client.messages
                    .create({
                       body: `[푸드 인사이드]음식점 예약이 완료되었습니다. \n금일 24시 전까지 미입금 시 예약이 취소 됩니다.\n은행명:기업은행\n입금 계좌:16711283701015\n입금자:${username}\n총 결제액: ${totalPrice}원`, 
                       from: '+12172921787',
                       to: `+82${contact}`
                     })
                    .then(async message => {
                        await sendReservationConfirmMail(username, totalPrice); 
                        console.log(message)
                    });
                    //isBooked = true로 변경
                    const owner = await prisma.updateOwner({
                        where:{
                            id: ownerId
                        },
                        data:{
                            calendar:{
                                updateMany:{
                                    where:{
                                        id_in: priceIdList,
                                    },
                                    data:{
                                        isBooked:true
                                    }
                                }
                            }
                        }
                    })

                    try{
                    //예약 생성
                        await prisma.createBooking({
                            owner:{
                                connect:{
                                    id: ownerId
                                }
                            },
                            profile:{
                                connect:{
                                    id: profile.id
                                }
                            },
                            prices:{
                                connect: priceIdInput
                            },
                            firstDate,
                            lastDate,
                            totalPrice,
                        });

                    }catch(e){
                        console.log(e)
                    }
                    
                    const exist = await prisma.$exists.favorite(filterOptions);

                    if(!exist){
                        await prisma.createFavorite({
                            profile:{
                                connect:{
                                    id: profile.id
                                }
                            },
                            owner:{
                                connect:{
                                    id: ownerId
                                }
                            }
                        })
                    }
                    return owner;
                }catch(e){
                    console.log(e);
                    throw Error("유효하지 않은 전화번호 입니다.")
                }
                }
        }
    }
};