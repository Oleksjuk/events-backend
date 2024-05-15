import { prismaClient } from '../model/PrismaClient.js'
import { body, query } from 'express-validator'

export class RegistrationController {
    createRegistraionForEvent = {
        validation: [
            body('fullName').notEmpty(),
            body('email').notEmpty(),
            body('dateOfBirth').notEmpty(),
            body('source').notEmpty(),
            body('eventId').notEmpty(),
        ],
        handler: async (req, res) => {
            const { fullName, email, dateOfBirth, source, eventId } = req.body

            const registration = await prismaClient.eventRegistration.create({
                data: {
                    eventId: eventId,
                    fullName: fullName,
                    email: email,
                    dateOfBirth: dateOfBirth,
                    source: source,
                    registerDate: Date.now()
                }
            })
        
            res.status(200).send(registration)
        }
    }

    getRegistration = {
        validation: [
            query('eventId').isInt().notEmpty(), 
            query('fullName', undefined).optional(),
            query('email', undefined).optional()
        ],
        handler: async (req, res) => {
            const eventId = Number(req.query.eventId)
            const fullName = req.query.fullName
            const email = req.query.email

            const result = await prismaClient.eventRegistration.findMany({
                where: {
                    eventId: eventId,
                    fullName: {
                        contains: fullName
                    },
                    email: {
                        contains: email
                    }
                }
            })

            res.status(200).send(result)
        }
    }

    getTodayEventRegistrationsCount = {
        validation: [
            query('eventId').exists()
        ],
        handler: async (req, res) => {
            const { eventId } = req.query.eventId

            const todayStart = new Date()
            todayStart.setUTCHours(0, 0, 0, 0)
            const todayEnd = new Date()
            todayEnd.setUTCHours(23, 59, 59, 999)
    
            const eventRegisrationsCount = await prismaClient.eventRegistration.count({
                where: {
                    eventId: eventId,
                    registerDate: {
                        lte: todayEnd.getTime(),
                        gte: todayStart.getTime()
                    }
                }
            })
    
            res.status(200).send({
                count: eventRegisrationsCount
            })
        }
    }
}

const registrationController = new RegistrationController()
export { registrationController }