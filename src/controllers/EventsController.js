import { prismaClient } from '../model/PrismaClient.js'
import { body, query } from 'express-validator'

export class EventsController {
    createEvent = {
        validation: [
            body('title').notEmpty(),
            body('description').notEmpty(),
            body('eventDate').notEmpty(),
            body('organizer').notEmpty(),
        ],
        handler: async (req, res) => {
            const { title, description, eventDate, organizer } = req.body

            const event = await prismaClient.event.create({
                data: {
                    title: title,
                    description: description,
                    eventDate: eventDate,
                    organizer: organizer
                }
            })

            res.status(200).json(event)
        }
    }

    getEvents = {
        validation: [
            query('offset').notEmpty(),
            query('amount').notEmpty(),
            query('title', undefined).optional(),
            query('startEventDate', undefined).optional(),
            query('endEventDate', undefined).optional(),
            query('organizer', undefined).optional()
        ],
        handler: async (req, res) => {
            const offset = Number(req.query.offset)
            const amount = Number(req.query.amount)

            const title = req.query.title
            const startEventDate = req.query.startEventDate
            const endEventDate = req.query.endEventDate
            const organizer = req.query.organizer

            const result = await prismaClient.event.findMany({
                where: {
                    title: {
                        contains: title
                    },
                    eventDate: {
                        lte: endEventDate,
                        gte: startEventDate
                    },
                    organizer: {
                        contains: organizer
                    },
                },
                skip: offset,
                take: amount
            })

            res.status(200).send(result)
        }
    }

    getCount = {
        validation:[],
        handler: async (req, res) => {
            const count = await prismaClient.event.count()

            res.status(200).send({
                count: count
            })
        }
    }
}

const eventsController = new EventsController()
export { eventsController }